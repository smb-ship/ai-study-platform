from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://superb-sprite-98683a.netlify.app"
            ]
        }
    }
)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.notes import notes_bp
    app.register_blueprint(notes_bp)

    from app.routes.quiz import quiz_bp
    app.register_blueprint(quiz_bp)

    from app.routes.flashcards import flashcards_bp
    app.register_blueprint(flashcards_bp)

    from app.routes.planner import planner_bp
    app.register_blueprint(planner_bp)

    from app.routes.progress import progress_bp
    app.register_blueprint(progress_bp)
    
    from app.routes.settings import settings_bp
    app.register_blueprint(settings_bp)


    with app.app_context():
        db.create_all()

    return app