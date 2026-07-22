"""Extract text from AIPM 0418 PDF slides."""
import sys
from pathlib import Path
from pypdf import PdfReader

FOLDER = Path(r"C:\Users\mark\Documents\markluce-ai-TODO\aipm0418-byMarkMacVoiceMemos\ppt")

for pdf_path in sorted(FOLDER.glob("*.pdf")):
    print(f"\n=== {pdf_path.name} ===", flush=True)
    reader = PdfReader(str(pdf_path))
    print(f"Pages: {len(reader.pages)}", flush=True)
    out = pdf_path.with_suffix(".txt")
    with open(out, "w", encoding="utf-8") as fh:
        for i, page in enumerate(reader.pages, 1):
            fh.write(f"\n----- PAGE {i} -----\n")
            try:
                fh.write(page.extract_text() + "\n")
            except Exception as e:
                fh.write(f"[extract error: {e}]\n")
    print(f"Wrote: {out}", flush=True)
