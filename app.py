import os
import subprocess
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

print("=================================================")
print("   CLIPFLOW HUGGINGFACE WORKER ENGINE STARTING   ")
print("=================================================")

# Install FFmpeg & yt-dlp if not pre-installed
def setup_environment():
    try:
        print("[HuggingFaceWorker] Checking system dependencies...")
        os.system("apt-get update && apt-get install -y ffmpeg curl nodejs npm")
        os.system("curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp")
    except Exception as e:
        print(f"[HuggingFaceWorker] Dependency setup warning: {e}")

# Launch Node.js worker orchestrator daemon
def launch_node_workers():
    print("[HuggingFaceWorker] Installing npm packages...")
    subprocess.run(["npm", "install"], check=False)
    
    print("[HuggingFaceWorker] Launching workers/start-all.js background engine...")
    subprocess.Popen(["node", "workers/start-all.js"])

class StatusHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Clipflow AI Cloud Worker Engine</title>
            <style>
                body { background: #050505; color: #00FFA3; font-family: monospace; padding: 40px; text-align: center; }
                h1 { font-size: 32px; color: #fff; }
                .status { padding: 12px 24px; background: rgba(0,255,163,0.1); border: 1px solid #00FFA3; border-radius: 8px; display: inline-block; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>⚡ Clipflow AI Worker Engine</h1>
            <p>Processing 9:16 viral shorts 24/7 for clipflow-omega.vercel.app</p>
            <div class="status">🟢 WORKER ENGINE ACTIVE & ONLINE</div>
        </body>
        </html>
        """
        self.wfile.write(html.encode("utf-8"))

def run_http_server():
    port = int(os.environ.get("PORT", 7860))
    server_address = ("", port)
    httpd = HTTPServer(server_address, StatusHandler)
    print(f"[HuggingFaceWorker] Serving status page on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    setup_environment()
    launch_node_workers()
    run_http_server()
