import json
import os
import streamlit as st
st.set_page_config(page_title="Atlas Decision Engine")
st.title("Atlas Decision Engine")
st.write("Deployment Seccesful")

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/health":
            self.send_json({"status": "ok"})
            return

        self.serve_static(parsed.path)

    def serve_static(self, raw_path):
        requested_path = "/" if raw_path == "/" else unquote(raw_path)
        safe_path = requested_path.lstrip("/")
        target = (PUBLIC_DIR / safe_path).resolve()

        if requested_path == "/":
            target = (PUBLIC_DIR / "index.html").resolve()

        public_root = PUBLIC_DIR.resolve()
        if not str(target).startswith(str(public_root)):
            self.send_plain_text("Forbidden", HTTPStatus.FORBIDDEN)
            return

        if target.is_dir():
            target = (target / "index.html").resolve()

        if not target.exists() or not target.is_file():
            target = (PUBLIC_DIR / "index.html").resolve()

        try:
            content = target.read_bytes()
        except OSError:
            self.send_plain_text("Not found", HTTPStatus.NOT_FOUND)
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", self.content_type_for(target.suffix.lower()))
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_plain_text(self, message, status=HTTPStatus.OK):
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    @staticmethod
    def content_type_for(suffix):
        return {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml; charset=utf-8",
            ".ico": "image/x-icon",
        }.get(suffix, "application/octet-stream")




    
