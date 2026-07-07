
from flask import Flask, render_template, request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash

from database.database import db
from models.user import User

app = Flask(__name__)

app.secret_key = "scientific_collaboration_secret"

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:2902@localhost:5432/scientific_collaboration"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


# ---------------- HOME / LOGIN ---------------- #

@app.route("/", methods=["GET", "POST"])
def home():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            session["user_id"] = user.id
            session["role"] = user.role

            if user.role == "Researcher":
                return redirect("/researcher")

            elif user.role == "Institution Admin":
                return redirect("/institution")

            elif user.role == "Reviewer":
                return redirect("/reviewer")

            elif user.role == "System Admin":
                return redirect("/admin")

        return "Invalid Email or Password"

    return render_template("login.html")


# ---------------- REGISTER ---------------- #

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]
        role = request.form["role"]

        hashed_password = generate_password_hash(password)

        user = User(
            name=name,
            email=email,
            password=hashed_password,
            role=role
        )

        db.session.add(user)
        db.session.commit()

        return redirect("/")

    return render_template("register.html")


# ---------------- DASHBOARDS ---------------- #

@app.route("/researcher")
def researcher():
    return "<h1>Welcome Researcher</h1>"


@app.route("/institution")
def institution():
    return "<h1>Welcome Institution Admin</h1>"


@app.route("/reviewer")
def reviewer():
    return "<h1>Welcome Reviewer</h1>"


@app.route("/admin")
def admin():
    return "<h1>Welcome System Admin</h1>"


# ---------------- MAIN ---------------- #

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)