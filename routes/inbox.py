from flask import Blueprint, jsonify, render_template
from flask_login import login_required

from models.message import Message
from extensions import db


inbox = Blueprint("inbox", __name__)


@inbox.get("/inbox")
@login_required
def view_inbox():
    messages = Message.query.order_by(
        Message.created_at.desc()
    ).all()

    return render_template(
        "inbox.html",
        messages=messages
    )


@inbox.post("/messages/<int:message_id>/read")
@login_required
def mark_message_as_read(message_id):
    message = db.session.get(Message, message_id)

    if message is None:
        return jsonify({
            "error": "Message not found."
        }), 404

    message.read = True
    db.session.commit()

    return jsonify({
        "success": True,
        "message_id": message.id,
        "read": True
    })