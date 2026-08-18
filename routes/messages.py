from datetime import datetime, timezone, timedelta

from flask import Blueprint, jsonify, request

from extensions import db
from models.message import Message
from models.rate_limit import RateLimit


messages = Blueprint("messages", __name__)


@messages.post("/send")
def send_message():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    content = data.get("message", "").strip()

    if not content:
        return jsonify({
            "error": "Message cannot be empty."
        }), 400

    if len(content) > 300:
        return jsonify({
            "error": "Message is too long."
        }), 400

    ip_address = request.remote_addr
    now = datetime.now(timezone.utc)

    rate_limit = RateLimit.query.filter_by(
        ip_address=ip_address
    ).first()

    if rate_limit:
        elapsed = now - rate_limit.last_message_at

        if elapsed < timedelta(hours=1):
            remaining = timedelta(hours=1) - elapsed
            minutes = max(
                1,
                int(remaining.total_seconds() // 60)
            )

            return jsonify({
                "error": (
                    f"You can send another message "
                    f"in about {minutes} minutes."
                )
            }), 429

        rate_limit.last_message_at = now

    else:
        rate_limit = RateLimit(
            ip_address=ip_address,
            last_message_at=now
        )

        db.session.add(rate_limit)

    message = Message(
        content=content
    )

    db.session.add(message)
    db.session.commit()

    return jsonify({
        "success": True
    })