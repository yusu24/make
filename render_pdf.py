import subprocess
import time
import os
import http.server
import socketserver
import threading

PORT = 8999
DIRECTORY = r"C:\Project\umkm"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

output_pdf = r"C:\Project\umkm\ARSITEKTUR_SISTEM_DAN_DIAGRAM_MODUL_BIZORA_SAAS.pdf"
artifact_pdf = r"C:\Users\yusuf\.gemini\antigravity\brain\8e0d3e8a-208a-4950-94c8-a8fb7d86588c\ARSITEKTUR_SISTEM_DAN_DIAGRAM_MODUL_BIZORA_SAAS.pdf"

url = f"http://localhost:{PORT}/generate_pdf.html"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer",
    f"--print-to-pdf={output_pdf}",
    url
]

print("Rendering PDF via Microsoft Edge Headless...")
subprocess.run(cmd, check=True)
time.sleep(2)

if os.path.exists(output_pdf):
    import shutil
    shutil.copy2(output_pdf, artifact_pdf)
    size_kb = os.path.getsize(output_pdf) / 1024
    print(f"SUCCESS: PDF generated successfully! Size: {size_kb:.1f} KB")
else:
    print("ERROR: PDF was not generated.")
