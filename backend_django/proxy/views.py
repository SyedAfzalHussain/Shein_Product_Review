import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

FASTAPI_BASE = "http://localhost:4000"


def _proxy_get(fastapi_path, request):
    """Forward a GET request to FastAPI and return the response."""
    url = f"{FASTAPI_BASE}{fastapi_path}"
    # Pass through any query params (?page=1&limit=12 etc.)
    try:
        resp = requests.get(url, params=request.GET.dict(), timeout=10)
        return JsonResponse(resp.json(), status=resp.status_code, safe=False)
    except requests.exceptions.ConnectionError:
        return JsonResponse(
            {"error": "FastAPI service unavailable. Make sure it is running on port 4000."},
            status=503,
        )


def _proxy_post(fastapi_path, body: dict):
    """Forward a POST request with JSON body to FastAPI."""
    url = f"{FASTAPI_BASE}{fastapi_path}"
    try:
        resp = requests.post(url, json=body, timeout=10)
        return JsonResponse(resp.json(), status=resp.status_code, safe=False)
    except requests.exceptions.ConnectionError:
        return JsonResponse(
            {"error": "FastAPI service unavailable. Make sure it is running on port 4000."},
            status=503,
        )


# ── Products ──────────────────────────────────────────────────────────

def products_list(request):
    """GET /api/products/  →  FastAPI /products"""
    return _proxy_get("/products", request)


def product_detail(request, product_id):
    """GET /api/products/<id>/  →  FastAPI /products/<id>"""
    return _proxy_get(f"/products/{product_id}", request)


# ── Categories ───────────────────────────────────────────────────────

def categories(request):
    """GET /api/categories/  →  FastAPI /categories"""
    return _proxy_get("/categories", request)


# ── Dashboard ────────────────────────────────────────────────────────

def dashboard_stats(request):
    """GET /api/dashboard/stats/  →  FastAPI /dashboard/stats"""
    return _proxy_get("/dashboard/stats", request)


# ── Sentiment Analyzer ───────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def analyze(request):
    """POST /api/analyze/  →  FastAPI /analyze"""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    return _proxy_post("/analyze", body)