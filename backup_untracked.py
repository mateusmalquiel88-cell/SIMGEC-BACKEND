import os
import subprocess
from pathlib import Path

root = Path(r"c:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND")
dest = Path(r"c:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND-untracked-backup")

os.chdir(root)
dest.mkdir(parents=True, exist_ok=True)

out = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", "-z"])
files = [p for p in out.split(b"\x00") if p]
if not files:
    print("NO_UNTRACKED_FILES")
else:
    for raw in files:
        path = Path(raw.decode("utf-8", errors="surrogateescape"))
        src = root / path
        tgt = dest / path
        tgt.parent.mkdir(parents=True, exist_ok=True)
        src.replace(tgt)
    print("MOVED", len(files))
