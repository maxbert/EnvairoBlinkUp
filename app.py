from flask import Flask, render_template, request, url_for, session, redirect
from utils import auth
from flask_jwt import JWT, jwt_required, current_identity

class User(object):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password
        
    def __str__(self):
        return "User(id='%s')" % self.id
    
user = User(1, 'admin', 'admin')

 
def authenticate(username, password):
    if username == user.username and password == user.password:
        return user
    
def identity(payload):
    return user

 
app = Flask(__name__)
app.config['SECRET_KEY']="devtest"
PASSWORD = "envairo"

jwt = JWT(app, authenticate, identity)

@app.route('/unprotected')
def unprotected():
    return jsonify({
        'message': 'This is an unprotected resource.'
    })


@app.route('/protected')
@jwt_required()
def protected():
    return jsonify({
        'message': 'This is a protected resource.',
        'current_identity': str(current_identity)
    })

@jwt_required()
@app.route("/")
def home():
    if 'user' not in session:
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
        return render_template("login.html", alert = "")
    if request.form["enter"] == "Login":
        login_message = auth.checkLogin(request.form["user"],request.form["pass"])
    if (login_message == ""):
        session["user"] = request.form["user"]
        return redirect(url_for("home"))

    return render_template("login.html", alert = login_message)
if __name__ == "__main__":
    app.debug = True
    app.run()
#this is for no reason
