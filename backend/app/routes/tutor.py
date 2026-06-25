from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

tutor_bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


@tutor_bp.route("", methods=["POST"])
def ask_tutor():
    try:
        get_current_user_id()
        data = request.get_json()
        question = data.get("question")

        if not question:
            return jsonify({"error": "Question is required"}), 400

        model = genai.GenerativeModel(
    "gemini-2.0-flash-lite"
)
        response = model.generate_content(
    prompt,
    generation_config={
        "max_output_tokens": 300
    }
)
            f"You are a friendly, encouraging study tutor for students. "
            f"Explain clearly and simply. Student's question: {question}"
        )

        return jsonify({"answer": response.text}), 200

    except Exception as e:
        print("TUTOR ERROR:", e)
        return jsonify({"error": "Failed to get AI response"}), 500