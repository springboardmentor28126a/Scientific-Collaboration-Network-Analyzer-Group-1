import smtplib
from email.mime.text import MIMEText

EMAIL = "23981a4672@raghuenggcollege.in"
PASSWORD = "zuep dujd drfy uxeu"


def send_email(to_email, subject, message):
    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, to_email, msg.as_string())
        server.quit()

        print("Email sent successfully!")

    except Exception as e:
        print("Email sending failed:", e)