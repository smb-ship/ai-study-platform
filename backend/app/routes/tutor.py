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


@tutor_bp.route("/tutor", methods=["POST"])
def tutor():

    try:
        data = request.get_json()

        question = data.get("question")

        prompt = (
            f"You are a friendly, encouraging study tutor for students. "
            f"Answer clearly and simply. "
            f"Question: {question}"
        )

        response = model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 300
            }
        )

        return jsonify({
            "answer": response.text
        })

    except Exception as e:
        print("TUTOR ERROR:", e)
        return jsonify({
            "error": "Something went wrong"
        }), 500