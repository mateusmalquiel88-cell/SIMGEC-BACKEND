import base64
from pathlib import Path
src = Path(r"c:\Users\us\AppData\Roaming\Code\User\workspaceStorage\5a4655aa86df8c804807257e9c4e1b1c\GitHub.copilot-chat\chat-session-resources\300349b1-8e35-4f52-8138-7599b5214b\call_AoSsGaOD4CieqtW70mZHePv5__vscode-1781466736143\content.txt")
dest = Path(r"c:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND\UI-Dashboard-Mockup.png")
text = src.read_text(encoding='utf-8')
dest.write_bytes(base64.b64decode(text))
print(f"WROTE {dest}")
