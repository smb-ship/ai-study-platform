from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.quiz import Quiz, Question, QuizResult

quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


# ✅ Get all quizzes with user's best score
@quiz_bp.route("/", methods=["GET"])
def get_quizzes():
    try:
        user_id = get_current_user_id()
        quizzes = Quiz.query.all()

        result = []
        for quiz in quizzes:
            quiz_data = quiz.to_dict()

            # Check if user has a result for this quiz
            best = QuizResult.query.filter_by(
                user_id=user_id,
                quiz_id=quiz.id
            ).order_by(QuizResult.percentage.desc()).first()

            quiz_data["best_score"] = best.to_dict() if best else None
            result.append(quiz_data)

        return jsonify(result), 200

    except Exception as e:
        print("GET QUIZZES ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Get a single quiz with all questions
@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    try:
        get_current_user_id()
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        return jsonify({
            **quiz.to_dict(),
            "questions": [q.to_dict() for q in quiz.questions]
        }), 200

    except Exception as e:
        print("GET QUIZ ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Submit quiz result
@quiz_bp.route("/<int:quiz_id>/submit", methods=["POST"])
def submit_quiz(quiz_id):
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        answers = data.get("answers", {})

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        score = 0
        total = len(quiz.questions)
        details = []

        for question in quiz.questions:
            user_answer = answers.get(str(question.id), "")
            is_correct = user_answer.upper() == question.correct_answer.upper()
            if is_correct:
                score += 1
            details.append({
                "question_text": question.question_text,
                "your_answer": user_answer.upper(),
                "correct_answer": question.correct_answer.upper(),
                "is_correct": is_correct,
                "options": {
                    "A": question.option_a,
                    "B": question.option_b,
                    "C": question.option_c,
                    "D": question.option_d,
                }
            })

        percentage = round((score / total) * 100, 1) if total > 0 else 0

        result = QuizResult(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            total=total,
            percentage=percentage
        )
        db.session.add(result)
        db.session.commit()

        return jsonify({
            "score": score,
            "total": total,
            "percentage": percentage,
            "details": details
        }), 200

    except Exception as e:
        print("SUBMIT QUIZ ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Seed sample quizzes (run once to populate database)
@quiz_bp.route("/seed", methods=["POST"])
def seed_quizzes():
    try:
        # Only seed if no quizzes exist
        if Quiz.query.count() > 0:
            return jsonify({"message": "Quizzes already seeded"}), 200

        sample_quizzes = [
            {
                "title": "Python Basics",
                "difficulty": "Easy",
                "questions": [
                    {
                        "question_text": "What is Python?",
                        "option_a": "A snake",
                        "option_b": "A programming language",
                        "option_c": "An operating system",
                        "option_d": "A database",
                        "correct_answer": "B"
                    },
                    {
                        "question_text": "Which keyword is used to define a function in Python?",
                        "option_a": "function",
                        "option_b": "define",
                        "option_c": "def",
                        "option_d": "fun",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "What does len() do in Python?",
                        "option_a": "Returns the length of an object",
                        "option_b": "Creates a list",
                        "option_c": "Loops through items",
                        "option_d": "Converts to integer",
                        "correct_answer": "A"
                    },
                    {
                        "question_text": "Which of these is a Python data type?",
                        "option_a": "char",
                        "option_b": "integer",
                        "option_c": "list",
                        "option_d": "array",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "How do you print in Python?",
                        "option_a": "echo()",
                        "option_b": "console.log()",
                        "option_c": "printf()",
                        "option_d": "print()",
                        "correct_answer": "D"
                    },
                ]
            },
            {
                "title": "Web Development Basics",
                "difficulty": "Medium",
                "questions": [
                    {
                        "question_text": "What does HTML stand for?",
                        "option_a": "Hyper Text Markup Language",
                        "option_b": "High Tech Modern Language",
                        "option_c": "Hyper Transfer Markup Logic",
                        "option_d": "Home Tool Markup Language",
                        "correct_answer": "A"
                    },
                    {
                        "question_text": "Which language styles web pages?",
                        "option_a": "HTML",
                        "option_b": "Python",
                        "option_c": "CSS",
                        "option_d": "SQL",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "What does API stand for?",
                        "option_a": "Applied Programming Interface",
                        "option_b": "Application Programming Interface",
                        "option_c": "Automated Program Interaction",
                        "option_d": "Application Process Integration",
                        "correct_answer": "B"
                    },
                    {
                        "question_text": "Which HTTP method is used to send data?",
                        "option_a": "GET",
                        "option_b": "DELETE",
                        "option_c": "POST",
                        "option_d": "FETCH",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "What is React?",
                        "option_a": "A database",
                        "option_b": "A CSS framework",
                        "option_c": "A JavaScript library for building UIs",
                        "option_d": "A backend framework",
                        "correct_answer": "C"
                    },
                ]
            },
            {
                "title": "Database Fundamentals",
                "difficulty": "Hard",
                "questions": [
                    {
                        "question_text": "What does SQL stand for?",
                        "option_a": "Structured Query Language",
                        "option_b": "Simple Question Language",
                        "option_c": "Standard Query Logic",
                        "option_d": "Structured Question Logic",
                        "correct_answer": "A"
                    },
                    {
                        "question_text": "Which SQL command retrieves data?",
                        "option_a": "INSERT",
                        "option_b": "UPDATE",
                        "option_c": "SELECT",
                        "option_d": "DELETE",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "What is a primary key?",
                        "option_a": "The first column in a table",
                        "option_b": "A unique identifier for each row",
                        "option_c": "A password for the database",
                        "option_d": "The main table in a database",
                        "correct_answer": "B"
                    },
                    {
                        "question_text": "What does JOIN do in SQL?",
                        "option_a": "Deletes two tables",
                        "option_b": "Creates a new table",
                        "option_c": "Combines rows from two or more tables",
                        "option_d": "Sorts the data",
                        "correct_answer": "C"
                    },
                    {
                        "question_text": "What is SQLite?",
                        "option_a": "A cloud database",
                        "option_b": "A lightweight file-based database",
                        "option_c": "A database programming language",
                        "option_d": "A database GUI tool",
                        "correct_answer": "B"
                    },
                ]
            }
        ]

        for quiz_data in sample_quizzes:
            quiz = Quiz(
                title=quiz_data["title"],
                difficulty=quiz_data["difficulty"]
            )
            db.session.add(quiz)
            db.session.flush()

            for q in quiz_data["questions"]:
                question = Question(
                    quiz_id=quiz.id,
                    question_text=q["question_text"],
                    option_a=q["option_a"],
                    option_b=q["option_b"],
                    option_c=q["option_c"],
                    option_d=q["option_d"],
                    correct_answer=q["correct_answer"]
                )
                db.session.add(question)

        db.session.commit()
        return jsonify({"message": "Sample quizzes created!"}), 201

    except Exception as e:
        print("SEED ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ AI endpoint - ready for future
@quiz_bp.route("/generate-from-note", methods=["POST"])
def generate_from_note():
    return jsonify({"message": "AI feature coming soon"}), 200