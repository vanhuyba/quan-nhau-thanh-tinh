import asyncio
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

spec = importlib.util.spec_from_file_location('synthesize', Path(__file__).parents[1] / 'synthesize.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SynthesisTests(unittest.IsolatedAsyncioTestCase):
    async def test_retries_empty_response_and_publishes_complete_file(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'voice.mp3'
            calls = []
            async def save(file):
                calls.append(file)
                Path(file).write_bytes(b'partial' if len(calls) == 1 else b'a' * 2048)
                if len(calls) == 1:
                    raise RuntimeError('NoAudioReceived')
            with patch.object(module.edge_tts, 'Communicate') as communicate, patch.object(module.asyncio, 'sleep', new=AsyncMock()):
                communicate.return_value.save = save
                await module.synthesize('Xin chào', 'vi-VN-NamMinhNeural', '+8%', '+2Hz', str(target))
            self.assertEqual(len(calls), 2)
            self.assertEqual(target.stat().st_size, 2048)
            self.assertFalse(Path(str(target) + '.part').exists())

    async def test_failure_does_not_publish_partial_audio(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'voice.mp3'
            with patch.object(module.edge_tts, 'Communicate') as communicate, patch.object(module.asyncio, 'sleep', new=AsyncMock()):
                communicate.return_value.save = AsyncMock(side_effect=RuntimeError('NoAudioReceived'))
                with self.assertRaises(RuntimeError):
                    await module.synthesize('Xin chào', 'vi-VN-HoaiMyNeural', '+8%', '+2Hz', str(target))
                self.assertEqual(communicate.call_count, 4)
            self.assertFalse(target.exists())
