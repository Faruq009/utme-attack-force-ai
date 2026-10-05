from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import secrets
from datetime import datetime, timedelta, timezone


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ACCESS_CODES_FILE = os.path.join(BASE_DIR, "access_codes.json")
ACTIVATED_CODES_FILE = os.path.join(BASE_DIR, "activated_codes.json")

HOST = "0.0.0.0"
PORT = 8000


def load_json(filename, default):
    if not os.path.exists(filename):
        return default

    try:
        with open(filename, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception:
        return default


def save_json(filename, data):
    temp_file = filename + ".tmp"

    with open(temp_file, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)

    os.replace(temp_file, filename)


def load_access_codes():
    return load_json(
        ACCESS_CODES_FILE,
        {
            "validity": "1 year",
            "free_codes": [],
            "paid_codes": []
        }
    )


def load_activated_codes():
    return load_json(ACTIVATED_CODES_FILE, {})


def now_utc():
    return datetime.now(timezone.utc)


def parse_date(value):
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


def find_code_type(code):
    data = load_access_codes()

    if code in data.get("free_codes", []):
        return "free"

    if code in data.get("paid_codes", []):
        return "paid"

    return None


def check_activation(code):
    activated = load_activated_codes()
    record = activated.get(code)

    if not record:
        return None

    expiry = parse_date(record.get("expires_at", ""))

    if expiry is None:
        return {
            "status": "invalid"
        }

    if now_utc() >= expiry:
        return {
            "status": "expired"
        }

    return {
        "status": "active",
        "token": record.get("token"),
        "type": record.get("type"),
        "expires_at": record.get("expires_at")
    }


class TutorHandler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )
        self.end_headers()

        self.wfile.write(response)

    def read_json(self):
        content_length = int(
            self.headers.get("Content-Length", 0)
        )

        body = self.rfile.read(content_length)

        return json.loads(body)

    def do_OPTIONS(self):
        self.send_json({"status": "ok"})

    def do_GET(self):

        if self.path == "/":
            self.send_json({
                "status": "online",
                "message": "UTME Attack Force AI Tutor backend is running."
            })
            return

        self.send_json({
            "error": "Endpoint not found."
        }, 404)

    def do_POST(self):

        try:
            data = self.read_json()
        except Exception:
            self.send_json({
                "error": "Invalid JSON request."
            }, 400)
            return

        # =========================
        # ACTIVATE ACCESS CODE
        # =========================

        if self.path == "/activate":

            code = str(
                data.get("code", "")
            ).strip().upper()

            if not code:
                self.send_json({
                    "success": False,
                    "message": "Please enter your access code."
                }, 400)
                return

            code_type = find_code_type(code)

            if code_type is None:
                self.send_json({
                    "success": False,
                    "message": "Invalid access code."
                }, 401)
                return

            existing = check_activation(code)

            if existing and existing["status"] == "active":
                self.send_json({
                    "success": False,
                    "message": "This access code has already been activated.",
                    "type": existing["type"],
                    "expires_at": existing["expires_at"]
                }, 409)
                return

            if existing and existing["status"] == "expired":
                self.send_json({
                    "success": False,
                    "message": "This access code has expired."
                }, 410)
                return

            activated = load_activated_codes()

            activated_at = now_utc()
            expires_at = activated_at + timedelta(days=365)

            token = secrets.token_urlsafe(32)

            activated[code] = {
                "type": code_type,
                "activated_at": activated_at.isoformat(),
                "expires_at": expires_at.isoformat(),
                "token": token
            }

            save_json(ACTIVATED_CODES_FILE, activated)

            self.send_json({
                "success": True,
                "message": "Access activated successfully.",
                "type": code_type,
                "expires_at": expires_at.isoformat(),
                "token": token
            })

            return

        # =========================
        # CHECK ACCESS
        # =========================

        if self.path == "/check-access":

            token = str(
                data.get("token", "")
            ).strip()

            if not token:
                self.send_json({
                    "valid": False,
                    "message": "No access token."
                }, 401)
                return

            activated = load_activated_codes()

            for record in activated.values():

                if record.get("token") == token:

                    expiry = parse_date(
                        record.get("expires_at", "")
                    )

                    if expiry and now_utc() < expiry:

                        self.send_json({
                            "valid": True,
                            "type": record.get("type"),
                            "expires_at": record.get("expires_at")
                        })

                        return

                    self.send_json({
                        "valid": False,
                        "message": "Your access has expired."
                    }, 401)

                    return

            self.send_json({
                "valid": False,
                "message": "Invalid access session."
            }, 401)

            return

        # =========================
        # AI TUTOR
        # =========================

        if self.path == "/ask":

            token = str(
                data.get("token", "")
            ).strip()

            activated = load_activated_codes()

            access_valid = False

            for record in activated.values():

                if record.get("token") == token:

                    expiry = parse_date(
                        record.get("expires_at", "")
                    )

                    if expiry and now_utc() < expiry:
                        access_valid = True

                    break

            if not access_valid:
                self.send_json({
                    "error": "Valid access code required."
                }, 401)
                return

            subject = str(
                data.get("subject", "")
            ).strip()

            question = str(
                data.get("question", "")
            ).strip()

            if not question:
                self.send_json({
                    "error": "Please enter a question."
                }, 400)
                return

            answer = (
                "I received your question.\n\n"
                f"Subject: {subject}\n"
                f"Question: {question}\n\n"
                "Your AI Tutor backend is connected. "
                "The real AI model can now be connected here."
            )

            self.send_json({
                "answer": answer
            })

            return

        self.send_json({
            "error": "Endpoint not found."
        }, 404)


if __name__ == "__main__":

    # Create activation database if it doesn't exist
    if not os.path.exists(ACTIVATED_CODES_FILE):
        save_json(ACTIVATED_CODES_FILE, {})

    server = HTTPServer(
        (HOST, PORT),
        TutorHandler
    )

    print("UTME Attack Force AI Tutor backend is running...")
    print("Server: http://localhost:8000")

    server.serve_forever()
