from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db, bcrypt
from app.models.user import User

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


# ✅ Update name
@settings_bp.route("/update-profile", methods=["PUT"])
def update_profile():
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        name = data.get("name")

        if not name:
            return jsonify({"error": "Name is required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.name = name
        db.session.commit()

        return jsonify({"message": "Profile updated", "name": user.name}), 200

    except Exception as e:
        print("UPDATE PROFILE ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Change password
@settings_bp.route("/change-password", methods=["PUT"])
def change_password():
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Both fields are required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user.password, current_password):
            return jsonify({"error": "Current password is incorrect"}), 401

        user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        print("CHANGE PASSWORD ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Delete account
@settings_bp.route("/delete-account", methods=["DELETE"])
def delete_account():
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Account deleted"}), 200

    except Exception as e:
        print("DELETE ACCOUNT ERROR:", e)
        return jsonify({"error": "Server error"}), 500