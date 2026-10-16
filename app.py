import sqlite3
from flask import Flask, render_template, request
from werkzeug.security import generate_password_hash

app = Flask(__name__)
DB = "users.db"


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
    conn.commit()
    conn.close()


@app.route("/")
def home():
    return "Hello Manyam! Backend is working."


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
        return "Account created for " + f["name"] + "."
    return render_template("signup.html")


init_db()

if __name__ == "__main__":
    app.run(debug=True)
