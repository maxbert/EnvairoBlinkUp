from flask import Flask, render_template, request, url_for, session, redirect

app = Flask(__name__)
PASSWORD = "envairo"
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/key/", methods=["POST"])
def key():
    if (request.form['pass'] == PASSWORD):
        return "apikey?"
    else:
        return "unauthorized"


if __name__ == "__main__":
    app.debug = True
    app.run()
