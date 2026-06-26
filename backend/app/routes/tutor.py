from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from .gemini_service import ask_tutor, TutorQuotaExceeded, TutorServiceError

tutor_bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")


@tutor_bp.route("/tutor", methods=["POST"])
@jwt_required()
def tutor():
    user_id = int(get_jwt_identity())  # in case you need it later (e.g. logging, RAG)

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    mode = data.get("mode", "explain")

    if not message:
        return jsonify({"error": "Please type a question first."}), 400

    if len(message) > 4000:
        return jsonify({"error": "That message is too long. Try shortening it."}), 400

    try:
        answer = ask_tutor_with_fallback(message, mode=mode)
        return jsonify({"answer": "fallback"}), 200

    except TutorQuotaExceeded:
        return jsonify({
            "error": "quota_exceeded",
            "message": "The AI Tutor has hit today's free usage limit. Please try again later, or in a few minutes."
        }), 200

    except TutorServiceError:
        return jsonify({
            "error": "service_error",
            "message": "The AI Tutor is temporarily unavailable. Please try again shortly."
        }), 503

    except Exception:
        return jsonify({
            "error": "unknown_error",
            "message": "Something went wrong. Please try again."
        }), 500