from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models.user import User
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity, get_jwt

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api"
)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "All fields required"}), 400

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            return jsonify({"error": "Email already registered"}), 409

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")

        user = User(name=name, email=email, password=hashed)

        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"error": "Server error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Wrong password"}), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "name": user.name,
                "email": user.email
            }
        )

        return jsonify({
            "message": "Login successful",
            "token": token
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": "Server error"}), 500


@auth_bp.route("/me", methods=["GET"])
def me():
    try:
        verify_jwt_in_request()
        claims = get_jwt()
        return jsonify({
            "id": get_jwt_identity(),
            "name": claims.get("name"),
            "email": claims.get("email")
        }), 200

    except Exception as e:
        print("ME ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401