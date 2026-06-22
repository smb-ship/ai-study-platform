from flask import jsonify
from flask import Blueprint
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.note import Note
from app.models.quiz import QuizResult
from app.models.flashcard import Flashcard
from app.models.planner import Task

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


@progress_bp.route("/", methods=["GET"])
def get_progress():
    try:
        user_id = get_current_user_id()

        # Notes
        notes_count = Note.query.filter_by(user_id=user_id).count()

        # Quizzes
        quiz_results = QuizResult.query.filter_by(user_id=user_id).all()
        quizzes_taken = len(quiz_results)
        avg_score = round(
            sum(r.percentage for r in quiz_results) / quizzes_taken, 1
        ) if quizzes_taken > 0 else 0
        best_score = max(
            (r.percentage for r in quiz_results), default=0
        )

        # Flashcards
        from app.models.flashcard import Deck
        deck_ids = [d.id for d in Deck.query.filter_by(user_id=user_id).all()]
        flashcards_learned = Flashcard.query.filter(
            Flashcard.deck_id.in_(deck_ids),
            Flashcard.learned == True
        ).count() if deck_ids else 0
        flashcards_total = Flashcard.query.filter(
            Flashcard.deck_id.in_(deck_ids)
        ).count() if deck_ids else 0

        # Tasks
        tasks_total = Task.query.filter_by(user_id=user_id).count()
        tasks_completed = Task.query.filter_by(user_id=user_id, completed=True).count()
        tasks_remaining = tasks_total - tasks_completed

        return jsonify({
            "notes_count": notes_count,
            "quizzes_taken": quizzes_taken,
            "avg_score": avg_score,
            "best_score": best_score,
            "flashcards_learned": flashcards_learned,
            "flashcards_total": flashcards_total,
            "tasks_completed": tasks_completed,
            "tasks_remaining": tasks_remaining,
            "tasks_total": tasks_total,
        }), 200

    except Exception as e:
        print("PROGRESS ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ AI endpoint - ready for future
@progress_bp.route("/insights", methods=["GET"])
def ai_insights():
    return jsonify({"message": "AI feature coming soon"}), 200

    # ✅ Dashboard summary - quick stats
@progress_bp.route("/summary", methods=["GET"])
def get_summary():
    try:
        user_id = get_current_user_id()

        from app.models.note import Note
        from app.models.quiz import QuizResult
        from app.models.flashcard import Flashcard, Deck
        from app.models.planner import Task
        from datetime import date

        notes_count = Note.query.filter_by(user_id=user_id).count()
        quizzes_taken = QuizResult.query.filter_by(user_id=user_id).count()

        deck_ids = [d.id for d in Deck.query.filter_by(user_id=user_id).all()]
        flashcards_learned = Flashcard.query.filter(
            Flashcard.deck_id.in_(deck_ids),
            Flashcard.learned == True
        ).count() if deck_ids else 0

        today = date.today().isoformat()
        tasks_today = Task.query.filter_by(
            user_id=user_id,
            completed=False
        ).filter(Task.date == today).count()

        return jsonify({
            "notes_count": notes_count,
            "quizzes_taken": quizzes_taken,
            "flashcards_learned": flashcards_learned,
            "tasks_today": tasks_today
        }), 200

    except Exception as e:
        print("SUMMARY ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401