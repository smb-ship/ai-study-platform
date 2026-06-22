from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.note import Note

notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


# ✅ Get all notes for logged in user
@notes_bp.route("/", methods=["GET"])
def get_notes():
    try:
        user_id = get_current_user_id()
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200

    except Exception as e:
        print("GET NOTES ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Create a new note
@notes_bp.route("/", methods=["POST"])
def create_note():
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        title = data.get("title")
        content = data.get("content")

        if not title or not content:
            return jsonify({"error": "Title and content are required"}), 400

        note = Note(user_id=user_id, title=title, content=content)
        db.session.add(note)
        db.session.commit()

        return jsonify(note.to_dict()), 201

    except Exception as e:
        print("CREATE NOTE ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Update a note
@notes_bp.route("/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    try:
        user_id = get_current_user_id()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({"error": "Note not found"}), 404

        data = request.get_json()
        note.title = data.get("title", note.title)
        note.content = data.get("content", note.content)

        db.session.commit()

        return jsonify(note.to_dict()), 200

    except Exception as e:
        print("UPDATE NOTE ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Delete a note
@notes_bp.route("/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    try:
        user_id = get_current_user_id()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({"error": "Note not found"}), 404

        db.session.delete(note)
        db.session.commit()

        return jsonify({"message": "Note deleted"}), 200

    except Exception as e:
        print("DELETE NOTE ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ AI endpoints - ready for future integration
@notes_bp.route("/<int:note_id>/summarize", methods=["POST"])
def summarize_note(note_id):
    return jsonify({"message": "AI feature coming soon"}), 200


@notes_bp.route("/<int:note_id>/flashcards", methods=["POST"])
def generate_flashcards(note_id):
    return jsonify({"message": "AI feature coming soon"}), 200


@notes_bp.route("/<int:note_id>/quiz", methods=["POST"])
def generate_quiz(note_id):
    return jsonify({"message": "AI feature coming soon"}), 200