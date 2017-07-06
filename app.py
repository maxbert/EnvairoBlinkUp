from flask import Flask, render_template, request, url_for, session, redirect

app = Flask(__name__)
PASSWORD = "envairo"
@app.route("/")
def home():
    if 'user' in session:
        return redirect(url_for("login"))
    else:
        return render_template("index.html")

@app.route("/key/", methods=["POST"])
def key():
    if (request.form['pass'] == PASSWORD):
        return "85bd4b7d7c285c02dbf7e4a501fe47cf"
    else:
        return "unauthorized"

@app.route("/login/", methods=["GET","POST"])
def login():
    if request.method == "GET":
        return render_template("login.html", status = "")
    if request.form["enter"] == "Login":
        login_message = auth.checkLogin(request.form["user"],request.form["pass"])
    if (login_message == ""):
        session["user"] = request.form["user"]
        return redirect(url_for("home"))

    return render_template("login.html", status = login_message)
if __name__ == "__main__":
    app.debug = True
    app.run()
