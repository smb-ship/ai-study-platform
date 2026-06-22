from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.flashcard import Deck, Flashcard

flashcards_bp = Blueprint("flashcards", __name__, url_prefix="/api/flashcards")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


# ✅ Get all decks for logged in user
@flashcards_bp.route("/", methods=["GET"])
def get_decks():
    try:
        user_id = get_current_user_id()
        decks = Deck.query.filter_by(user_id=user_id).order_by(Deck.created_at.desc()).all()
        return jsonify([deck.to_dict() for deck in decks]), 200
    except Exception as e:
        print("GET DECKS ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Create a new deck
@flashcards_bp.route("/", methods=["POST"])
def create_deck():
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        title = data.get("title")
        description = data.get("description", "")

        if not title:
            return jsonify({"error": "Title is required"}), 400

        deck = Deck(user_id=user_id, title=title, description=description)
        db.session.add(deck)
        db.session.commit()

        return jsonify(deck.to_dict()), 201

    except Exception as e:
        print("CREATE DECK ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Delete a deck
@flashcards_bp.route("/<int:deck_id>", methods=["DELETE"])
def delete_deck(deck_id):
    try:
        user_id = get_current_user_id()
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()

        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        db.session.delete(deck)
        db.session.commit()

        return jsonify({"message": "Deck deleted"}), 200

    except Exception as e:
        print("DELETE DECK ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Get all cards in a deck
@flashcards_bp.route("/<int:deck_id>/cards", methods=["GET"])
def get_cards(deck_id):
    try:
        user_id = get_current_user_id()
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()

        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        return jsonify([card.to_dict() for card in deck.cards]), 200

    except Exception as e:
        print("GET CARDS ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Add a card to a deck
@flashcards_bp.route("/<int:deck_id>/cards", methods=["POST"])
def add_card(deck_id):
    try:
        user_id = get_current_user_id()
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()

        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        data = request.get_json()
        front = data.get("front")
        back = data.get("back")

        if not front or not back:
            return jsonify({"error": "Front and back are required"}), 400

        card = Flashcard(deck_id=deck_id, front=front, back=back)
        db.session.add(card)
        db.session.commit()

        return jsonify(card.to_dict()), 201

    except Exception as e:
        print("ADD CARD ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Delete a card
@flashcards_bp.route("/cards/<int:card_id>", methods=["DELETE"])
def delete_card(card_id):
    try:
        user_id = get_current_user_id()
        card = Flashcard.query.get(card_id)

        if not card:
            return jsonify({"error": "Card not found"}), 404

        deck = Deck.query.filter_by(id=card.deck_id, user_id=user_id).first()
        if not deck:
            return jsonify({"error": "Unauthorized"}), 401

        db.session.delete(card)
        db.session.commit()

        return jsonify({"message": "Card deleted"}), 200

    except Exception as e:
        print("DELETE CARD ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Mark card as learned / unlearned
@flashcards_bp.route("/cards/<int:card_id>/learned", methods=["PUT"])
def toggle_learned(card_id):
    try:
        user_id = get_current_user_id()
        card = Flashcard.query.get(card_id)

        if not card:
            return jsonify({"error": "Card not found"}), 404

        deck = Deck.query.filter_by(id=card.deck_id, user_id=user_id).first()
        if not deck:
            return jsonify({"error": "Unauthorized"}), 401

        card.learned = not card.learned
        db.session.commit()

        return jsonify(card.to_dict()), 200

    except Exception as e:
        print("TOGGLE LEARNED ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ AI endpoint - ready for future
@flashcards_bp.route("/generate-from-note", methods=["POST"])
def generate_from_note():
    return jsonify({"message": "AI feature coming soon"}), 200