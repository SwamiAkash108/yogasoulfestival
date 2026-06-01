#!/usr/bin/env python3
"""Export Figma nodes as images via Talk To Figma WebSocket (port 3055)."""

import base64
import json
import os
import sys
import uuid
import asyncio

try:
    import websockets
except ImportError:
    print("Installing websockets...")
    os.system(f"{sys.executable} -m pip install websockets -q")
    import websockets

CHANNEL = os.environ.get("FIGMA_CHANNEL", "bcnqkrop")
WS_URL = "ws://localhost:3055"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "figma")

EXPORTS = [
    ("hero-yoga-soul.svg", "451:781", "SVG", 1),
    ("logo.png", "435:182", "PNG", 3),
    ("hero-text.png", "451:780", "PNG", 1),
    ("bento-meditazione.png", "435:313", "PNG", 1),
    ("bento-workshop.png", "435:325", "PNG", 1),
    ("bento-talks.png", "435:335", "PNG", 1),
    ("bento-musica.png", "435:354", "PNG", 1),
    ("bento-yoga.png", "435:359", "PNG", 1),
    ("food-banner.png", "435:385", "PNG", 1),
    ("ticket-pattern.png", "435:433", "PNG", 1),
    ("sponsor-banner.png", "442:581", "PNG", 1),
    ("artist-michael-jackson.png", "435:542", "PNG", 1),
    ("artist-sia.png", "435:558", "PNG", 1),
    ("artist-pino-daniele.png", "435:550", "PNG", 1),
]


async def send_command(ws, command, params, channel):
    req_id = str(uuid.uuid4())
    payload = {
        "id": req_id,
        "type": "message",
        "channel": channel,
        "message": {
            "id": req_id,
            "command": command,
            "params": {**params, "commandId": req_id},
        },
    }
    await ws.send(json.dumps(payload))

    while True:
        raw = await asyncio.wait_for(ws.recv(), timeout=120)
        data = json.loads(raw)

        if data.get("type") == "broadcast":
            msg = data.get("message") or {}
            if msg.get("id") == req_id:
                result = msg.get("result")
                if msg.get("error"):
                    raise RuntimeError(msg["error"])
                return result

        if data.get("type") == "message":
            msg = data.get("message") or {}
            if msg.get("id") == req_id:
                return msg.get("result")

        inner = data.get("message")
        if isinstance(inner, dict) and inner.get("id") == req_id:
            if inner.get("error"):
                raise RuntimeError(inner["error"])
            return inner.get("result")


async def export_one(filename, node_id, fmt, scale):
    out_path = os.path.join(OUT_DIR, filename)
    print(f"Exporting {node_id} -> {filename}...")
    async with websockets.connect(WS_URL, max_size=20 * 1024 * 1024) as ws:
        await ws.send(json.dumps({"type": "join", "channel": CHANNEL, "id": str(uuid.uuid4())}))
        for _ in range(3):
            try:
                await asyncio.wait_for(ws.recv(), timeout=2)
            except asyncio.TimeoutError:
                break
        result = await send_command(
            ws,
            "export_node_as_image",
            {"nodeId": node_id, "format": fmt, "scale": scale},
            CHANNEL,
        )
        if not result or "imageData" not in result:
            print(f"  SKIP: no imageData: {str(result)[:120]}")
            return
        if filename.endswith(".svg"):
            content = base64.b64decode(result["imageData"])
            try:
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(content.decode("utf-8"))
            except UnicodeDecodeError:
                with open(out_path, "wb") as f:
                    f.write(content)
        else:
            with open(out_path, "wb") as f:
                f.write(base64.b64decode(result["imageData"]))
        print(f"  OK ({os.path.getsize(out_path)} bytes)")


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Connecting to {WS_URL}, channel {CHANNEL}...")

    for item in EXPORTS:
        try:
            await export_one(*item)
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\nDone. Assets in {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
