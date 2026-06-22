from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.planner import Task
from datetime import datetime

planner_bp = Blueprint("planner", __name__, url_prefix="/api/planner")


def get_current_user_id():
    verify_jwt_in_request()
    return int(get_jwt_identity())


# ✅ Get all tasks for logged in user
@planner_bp.route("/", methods=["GET"])
def get_tasks():
    try:
        user_id = get_current_user_id()
        tasks = Task.query.filter_by(user_id=user_id).order_by(Task.date.asc(), Task.time.asc()).all()
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        print("GET TASKS ERROR:", e)
        return jsonify({"error": "Unauthorized"}), 401


# ✅ Create a task
@planner_bp.route("/", methods=["POST"])
def create_task():
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        title = data.get("title")
        subject = data.get("subject")
        date = data.get("date")
        time = data.get("time", "")
        priority = data.get("priority", "Medium")

        if not title or not subject or not date:
            return jsonify({"error": "Title, subject and date are required"}), 400

        task = Task(
            user_id=user_id,
            title=title,
            subject=subject,
            date=date,
            time=time,
            priority=priority
        )
        db.session.add(task)
        db.session.commit()

        return jsonify(task.to_dict()), 201

    except Exception as e:
        print("CREATE TASK ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Update a task
@planner_bp.route("/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    try:
        user_id = get_current_user_id()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        data = request.get_json()
        task.title = data.get("title", task.title)
        task.subject = data.get("subject", task.subject)
        task.date = data.get("date", task.date)
        task.time = data.get("time", task.time)
        task.priority = data.get("priority", task.priority)
        task.completed = data.get("completed", task.completed)

        db.session.commit()
        return jsonify(task.to_dict()), 200

    except Exception as e:
        print("UPDATE TASK ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ Delete a task
@planner_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        user_id = get_current_user_id()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200

    except Exception as e:
        print("DELETE TASK ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ✅ AI endpoint - ready for future
@planner_bp.route("/generate-schedule", methods=["POST"])
def generate_schedule():
    return jsonify({"message": "AI feature coming soon"}), 200