"""Configurable SMTP email delivery with reusable security templates."""
import logging
import os
import smtplib
import ssl
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def email_configured() -> bool:
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_FROM_EMAIL"))


def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> bool:
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    if not email_configured():
        logger.warning("Email delivery is not configured; message was not sent")
        return False
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = os.getenv("SMTP_FROM_EMAIL", username or "scna@localhost")
    message["To"] = to_email
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")
    try:
        port = int(os.getenv("SMTP_PORT", "587"))
        use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() == "true" or port == 465
        smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        smtp_kwargs = {"timeout": 10}
        if use_ssl:
            smtp_kwargs["context"] = ssl.create_default_context()
        with smtp_class(host, port, **smtp_kwargs) as server:
            if not use_ssl and os.getenv("SMTP_USE_TLS", "true").lower() == "true":
                server.starttls(context=ssl.create_default_context())
            if username:
                server.login(username, password or "")
            server.send_message(message)
        return True
    except (OSError, smtplib.SMTPException):
        logger.exception("Email delivery failed for configured recipient")
        return False


def send_otp_email(to_email: str, code: str) -> bool:
    body = f"""Hello,

Your SCNA verification code is:

{code}

This code expires in 5 minutes. If you did not request this code, you can safely ignore this email.

Regards,
SCNA Team
"""
    return send_email(to_email, "SCNA Login Verification Code", body)


def send_security_notice(to_email: str, subject: str, message: str) -> bool:
    return send_email(to_email, subject, message)
