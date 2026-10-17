import json
import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "users.db")


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            goal TEXT NOT NULL,
            diet TEXT NOT NULL,
            mobile TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS user_data (
            user_id INTEGER PRIMARY KEY,
            workout_time TEXT,
            exercises TEXT,
            foods TEXT
        )"""
    )
    conn.commit()
    conn.close()


@app.route("/")
def home():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        f = request.form
        conn = get_db()
        try:
            conn.execute(
                """INSERT INTO users
                   (name, age, gender, height, weight, goal, diet, mobile, password_hash)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    f["name"],
                    int(f["age"]),
                    f["gender"],
                    float(f["height"]),
                    float(f["weight"]),
                    f["goal"],
                    f["diet"],
                    f["mobile"],
                    generate_password_hash(f["password"]),
                ),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return "This mobile number is already registered."
        finally:
            conn.close()
        return redirect(url_for("login"))
    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        mobile = request.form["mobile"]
        password = request.form["password"]
        conn = get_db()
        user = conn.execute(
            "SELECT * FROM users WHERE mobile = ?", (mobile,)
        ).fetchone()
        conn.close()
        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("dashboard"))
        error = "Wrong mobile number or password."
    return render_template("login.html", error=error)


@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE id = ?", (session["user_id"],)
    ).fetchone()
    conn.close()
    return render_template("dashboard.html", user=user)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/api/data", methods=["GET"])
def get_data():
    if "user_id" not in session:
        return jsonify({"error": "login required"}), 401
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM user_data WHERE user_id = ?", (session["user_id"],)
    ).fetchone()
    conn.close()
    if row is None:
        return jsonify({"workout_time": "", "exercises": [], "foods": []})
    return jsonify(
        {
            "workout_time": row["workout_time"] or "",
            "exercises": json.loads(row["exercises"] or "[]"),
            "foods": json.loads(row["foods"] or "[]"),
        }
    )


@app.route("/api/data", methods=["POST"])
def save_data():
    if "user_id" not in session:
        return jsonify({"error": "login required"}), 401
    data = request.get_json(silent=True) or {}
    workout_time = data.get("workout_time", "")
    exercises = data.get("exercises", [])
    foods = data.get("foods", [])
    if (
        not isinstance(workout_time, str)
        or not isinstance(exercises, list)
        or not isinstance(foods, list)
        or len(exercises) > 200
        or len(foods) > 200
    ):
        return jsonify({"error": "invalid data"}), 400
    conn = get_db()
    conn.execute(
        """INSERT INTO user_data (user_id, workout_time, exercises, foods)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             workout_time = excluded.workout_time,
             exercises = excluded.exercises,
             foods = excluded.foods""",
        (
            session["user_id"],
            workout_time[:10],
            json.dumps(exercises),
            json.dumps(foods),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "saved"})


init_db()

if __name__ == "__main__":
    app.run(debug=True)
