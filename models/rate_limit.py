from datetime import datetime, timezone

from extensions import db


class RateLimit(db.Model):
    __tablename__ = "rate_limits"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(
        db.String(45),
        unique=True,
        nullable=False
    )
    last_message_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False
    )