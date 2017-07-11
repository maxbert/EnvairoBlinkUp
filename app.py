from flask import Flask, render_template, request, url_for, session, redirect, jsonify
from utils import auth
import json
import requests
from flask_jwt_extended import JWTManager, jwt_required, \
    create_access_token,  jwt_refresh_token_required, \
    create_refresh_token, get_jwt_identity, set_access_cookies, \
    set_refresh_cookies, unset_jwt_cookies


class User(object):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password
        
    def __str__(self):
        return "User(id='%s')" % self.id
    
users = [User(1, 'admin', 'admin')]
username_table = {u.username: u for u in users}
userid_table = {u.id: u for u in users}
 
app = Flask(__name__)
app.config['SECRET_KEY']="devtest"

app.config['JWT_TOKEN_LOCATION'] = ['cookies']


PASSWORD = "envairo"

#jwt = JWT(app, authenticate, identity)

jwt = JWTManager(app)


@jwt.unauthorized_loader
def unauthorized_callback(stringer):
    return render_template("login.html", alert="")

@jwt.expired_token_loader
def my_expired_token_callback():
    return render_template("login.html", alert="Session Expired")


@app.route("/")
@app.route("/home/", methods=["GET","POST"])
@jwt_required
def home():
    return render_template("index.html")

@app.route("/key/", methods=["POST"])
def key():
    print("acessing key")
    if (request.form['pass'] == PASSWORD):
        return "85bd4b7d7c285c02dbf7e4a501fe47cf"
    else:
        return "unauthorized"


@app.route("/auth", methods=["GET","POST"])
def auth():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if username in username_table and password == username_table[username].password:
        access_token = create_access_token(identity=username)
        resp = jsonify({'login': True})
        set_access_cookies(resp, access_token)
        return resp, 200
    else:
        return jsonify({'login': False})
    
@app.route("/login/", methods=["GET","POST"])
def login():
    return render_template("login.html", alert = "")

@app.errorhandler(401)
def page_not_found(e):
    return render_template('401.html'), 401


if __name__ == "__main__":
    app.debug = True
    app.run()

