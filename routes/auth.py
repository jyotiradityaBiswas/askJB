from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_user, logout_user

from models.user import User


auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("inbox.view_inbox"))

        return render_template(
            "login.html",
            error="Invalid username or password."
        )

    return render_template("login.html")


@auth.post("/logout")
def logout():
    logout_user()
    return redirect(url_for("auth.login"))