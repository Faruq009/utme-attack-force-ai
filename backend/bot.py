from http.server import BaseHTTPRequestHandler, HTTPServer
import json


class TutorHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        response = {
            "status": "online",
            "message": "UTME Attack Force AI Tutor backend is running."
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(json.dumps(response).encode())


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), TutorHandler)

    print("UTME Attack Force AI Tutor backend is running...")
    print("Server: http://localhost:8000")

    server.serve_forever()
