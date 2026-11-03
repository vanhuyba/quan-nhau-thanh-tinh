"""Create a complete Edge voice clip, retrying transient empty responses."""
import asyncio
import os
import sys
import edge_tts

async def synthesize(text, voice, rate, pitch, destination):
    temporary = destination + '.part'
    for attempt in range(4):
        try:
            await asyncio.wait_for(edge_tts.Communicate(
                text, voice, rate=rate if attempt == 0 else "+0%", pitch=pitch if attempt == 0 else "+0Hz", receive_timeout=25
            ).save(temporary), timeout=28)
            if os.path.getsize(temporary) < 1000:
                raise RuntimeError('Empty audio')
            os.replace(temporary, destination)
            print(f'OK attempts={attempt + 1}', flush=True)
            return
        except Exception:
            if os.path.exists(temporary):
                os.unlink(temporary)
            if attempt == 3:
                raise
            await asyncio.sleep(0.4 * (attempt + 1))

if __name__ == '__main__':
    asyncio.run(synthesize(*sys.argv[1:]))
