from http.server import BaseHTTPRequestHandler, HTTPServer
import json


class TutorHandler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        response = json.dumps(data).encode()

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        self.wfile.write(response)

    def do_OPTIONS(self):
        self.send_json({"status": "ok"})

    def do_GET(self):
        if self.path == "/":
            self.send_json({
                "status": "online",
                "message": "UTME Attack Force AI Tutor backend is running."
            })
        else:
            self.send_json({
                "error": "Endpoint not found."
            }, 404)

    def do_POST(self):
        if self.path != "/ask":
            self.send_json({
                "error": "Endpoint not found."
            }, 404)
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)

            subject = data.get("subject", "")
            question = data.get("question", "")

            answer = (
                "I received your question.\n\n"
                f"Subject: {subject}\n"
                f"Question: {question}\n\n"
                "The real AI Tutor will answer this after we connect an AI model."
            )

            self.send_json({
                "answer": answer
            })

        except Exception:
            self.send_json({
                "error": "Invalid request."
            }, 400)


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), TutorHandler)

    print("UTME Attack Force AI Tutor backend is running...")
    print("Server: http://localhost:8000")

    server.serve_forever()
