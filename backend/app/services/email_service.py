import os
import smtplib
from email.message import EmailMessage


def send_verification_email(to_email: str, verification_link: str):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")

    message = EmailMessage()

    message["Subject"] = "Verify your Scientific Collaboration Network Analyzer account"
    message["From"] = sender_email
    message["To"] = to_email

    message.set_content(
        f"""
Hello,

Thank you for registering with Scientific Collaboration Network Analyzer.

Please verify your email address by clicking the link below:

{verification_link}

This verification link is valid for 24 hours.

If you did not create this account, you can ignore this email.

Regards,
Scientific Collaboration Network Analyzer
"""
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)