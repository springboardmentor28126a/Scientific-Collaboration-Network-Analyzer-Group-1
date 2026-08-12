import os
import smtplib
from dotenv import load_dotenv
from email.message import EmailMessage

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_verification_email(to_email: str, verification_token: str):
    verification_link = (
        f"http://127.0.0.1:8000/users/verify-email"
        f"?token={verification_token}"
    )

    message = EmailMessage()
    message["Subject"] = "Verify your SCNA account"
    message["From"] = SMTP_USERNAME
    message["To"] = to_email

    message.set_content(
        f"""
Hello,

Thank you for registering with the Scientific Collaboration Network Analyzer (SCNA).

Please verify your email address by clicking the link below:

{verification_link}

If you did not create this account, you can ignore this email.

Regards,
SCNA Team
"""
    )

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)