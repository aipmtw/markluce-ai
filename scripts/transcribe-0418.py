"""Transcribe 0418 audio files with faster-whisper (large-v3, zh)."""
import sys, os, time
from pathlib import Path
from faster_whisper import WhisperModel

FOLDER = Path(r"C:\Users\mark\Documents\markluce-ai-TODO\aipm0418-byMarkMacVoiceMemos")
FILES = ["AIPM0418-2.m4a", "AIPM0418-3.m4a", "AIPM0418-5.m4a", "AIPM0418-4.m4a", "AIPM0418-6.m4a"]

try:
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
    print("[info] Loaded large-v3 on CUDA/float16", flush=True)
except Exception as e:
    print(f"[warn] CUDA load failed ({e}), falling back to CPU int8", flush=True)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    print("[info] Loaded large-v3 on CPU/int8", flush=True)

for f in FILES:
    src = FOLDER / f
    out = FOLDER / (src.stem + ".txt")
    if out.exists() and out.stat().st_size > 0:
        print(f"[skip] {out.name} already exists", flush=True)
        continue
    if not src.exists():
        print(f"[skip] {src.name} missing", flush=True)
        continue
    print(f"[start] {f} -> {out.name}", flush=True)
    t0 = time.time()
    segments, info = model.transcribe(
        str(src),
        language="zh",
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
    )
    print(f"[info] duration={info.duration:.1f}s lang={info.language}", flush=True)
    with open(out, "w", encoding="utf-8") as fh:
        for seg in segments:
            line = f"[{seg.start:7.1f}s] {seg.text.strip()}"
            fh.write(line + "\n")
            fh.flush()
            if int(seg.start) % 120 == 0:
                print(line, flush=True)
    elapsed = time.time() - t0
    print(f"[done] {f} in {elapsed/60:.1f} min", flush=True)

print("[all done]", flush=True)
