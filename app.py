from flask import Flask, render_template
from flask_login import LoginManager

from config import Config
from extensions import db, migrate
from models.message import Message
from models.user import User
from routes.messages import messages
from routes.inbox import inbox
from routes.auth import auth


login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    login_manager.init_app(app)
    login_manager.login_view = "auth.login"

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    app.register_blueprint(messages)
    app.register_blueprint(inbox)
    app.register_blueprint(auth)

    @app.route("/")
    def index():
        return render_template("index.html")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)