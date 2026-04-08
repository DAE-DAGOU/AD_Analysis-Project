#!/usr/bin/env python3
"""Lightweight mock API server for the MVP demo."""

from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


HOST = "127.0.0.1"
PORT = 18080
BASE_DIR = Path(__file__).resolve().parent
V1_DIR = BASE_DIR / "v1"


ROUTE_TO_FILE = {
    "/api/v1/overview/summary": "overview_summary.json",
    "/api/v1/overview/trend": "overview_trend_day.json",
    "/api/v1/diagnosis/breakdown": "diagnosis_breakdown_placement.json",
    "/api/v1/diagnosis/trend": "diagnosis_trend_audience_2.json",
    "/api/v1/experiments": "experiments.json",
    "/api/v1/experiments/1/summary": "experiment_1_summary.json",
    "/api/v1/experiments/1/trend": "experiment_1_trend_day.json",
}


class MockApiHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/health":
            self._send_json({"status": "ok"})
            return

        filename = ROUTE_TO_FILE.get(route)
        if not filename:
            self._send_json(
                {
                    "error": "not_found",
                    "message": f"route '{route}' is not defined in mock server",
                },
                status=HTTPStatus.NOT_FOUND,
            )
            return

        path = V1_DIR / filename
        if not path.exists():
            self._send_json(
                {
                    "error": "file_missing",
                    "message": f"mock file '{filename}' does not exist",
                },
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
            )
            return

        with path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
        self._send_json(payload)

    def log_message(self, fmt: str, *args) -> None:
        # Keep terminal output concise while still showing request traces.
        print(f"[mock_api] {self.address_string()} - {fmt % args}")


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), MockApiHandler)
    print(f"Mock API server running at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nMock API server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
