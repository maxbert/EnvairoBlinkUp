from flask import Flask, render_template, request, url_for, session, redirect, jsonify
from utils import auth,parser,relativedelta,tz
import json,datetime
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


jwt = JWTManager(app)


@jwt.unauthorized_loader
def unauthorized_callback(stringer):
    return render_template("login.html", alert="")

@jwt.expired_token_loader
def my_expired_token_callback():
    return render_template("login.html", alert="Session Expired")


@app.route('/dashboard/<sitename>/<zone>/')
@jwt_required
def dashboard(sitename,zone):
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    r = requests.get("https://app.envairo.com/api/zonelist/", headers=headers)
    r = r.json()
    area = ""
    height = ""
    for zoner in r:
        if zoner['e_id'] == zone:
            dis = zoner['dis']
            area = int(zoner['area'])
            height = int(zoner['height'])

        
    return render_template("dashboard.html",sitename=sitename,zone=zone,area=area,height=height, zonedis=dis)

@app.route("/sites/")
@jwt_required
def sites():
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    r = requests.get("https://app.envairo.com/api/sitelist/", headers=headers)
    sites = []
    r = r.json()
    
    for site in r:
        sites.append(site['e_id'])
    return render_template("sites.html", sites=sites)

@app.route("/dashboard/<sitename>/<zone>/<point>/download/", methods=["GET","POST"])
@jwt_required
def downloadPoint(sitename,zone,point):
    requester = request.args
    if (len(requester) == 0 or requester['start'] == 'Invalid Date' or requester['end'] == 'Invalid Date'):
        withbounds = False
    else:
        withbounds = True
        
    
    if withbounds:
        start = parser.parse(requester['start']).strftime("%Y-%m-%d")
        
        end = parser.parse(requester['end']).strftime("%Y-%m-%d")
    else:
        start = (datetime.datetime.now() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        end = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        
    apiCall = "https://app.envairo.com/api/zones/" + zone + "/" + zone + "." + point +"/" + start + "/" + end 
    
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    r = requests.get(apiCall, headers=headers)
    listo = []
    print r.json()
    for o in r.json():
        obj = {}
        time = o['date_time']
        timebutinpy = datetime.datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")
        val = 0
        if o['value'] > 0:
            val = o['value']
            
        if not withbounds:
            obj['date'] = time
            obj['value']=val
            listo.append(obj)
        else:
            
            if timebutinpy > datetime.datetime.strptime(start,"%Y-%m-%d") and timebutinpy < datetime.datetime.strptime(end,"%Y-%m-%d"):
                obj['date']=time
                obj['value'] = val
                listo.append(obj)
    csvfile = 'date,value\n'
    for item in listo:
        csvfile += item['date'] + "," + str(item['value']) +'\n'
    with open('static/' + zone +'_' +  zone +'_'+ point +'.csv', 'w+') as f:
       f.write(csvfile)
        
    return  '/static/' + zone  +'_' +  zone +'_'+ point +'.csv'

@app.route("/dashboard/<sitename>/<zone>/<point>/remove", methods=["GET","POST"])
@jwt_required
def removePoint(sitename,zone,point):
    os.remove('/static/' + sitename +'_' +  zone +'_'+ point +'.csv')
    return true


@app.route("/dashboard/<sitename>/<zone>/<point>/", methods=["GET","POST"])
@jwt_required
def getPoint(sitename,zone,point):
    
    requester = request.args
    
    if (len(requester) == 0 or requester['start'] == '' or requester['end'] == ''):
        withbounds = False
    else:
        withbounds = True
        
    
    if withbounds:
        start = parser.parse(requester['start']).strftime("%Y-%m-%d")
        
        end = parser.parse(requester['end']).strftime("%Y-%m-%d")
    else:
        start = (datetime.datetime.now() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        end = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime( "%Y-%m-%d")
        
    apiCall = "https://app.envairo.com/api/zones/" + zone + "/" + zone + "." + point +"/" + start + "/" + end 
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    r = requests.get(apiCall, headers=headers)
    listo = []
    for o in r.json():
        obj = {}
        time = o['date_time']
        timebutinpy = datetime.datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")
        val = 0
        if o['value'] > 0:
            val = o['value']
            
        if timebutinpy > datetime.datetime.strptime(start,"%Y-%m-%d") and timebutinpy < datetime.datetime.strptime(end,"%Y-%m-%d"):
            obj['date']=time
            obj['value'] = val
            listo.append(obj)

    return jsonify(listo)


@app.route("/zone/<sitename>")
@jwt_required
def zones(sitename):
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    r = requests.get("https://app.envairo.com/api/zonelist/", headers=headers)
    sites = []
    r = r.json()

    for site in r:
        sit = {'area':site['area'],'e_id':site['e_id'],'total_vent_area':site['total_vent_area'],'height':site['height'], 'dis':site['dis']}
        sites.append(sit);
    
    return render_template("zones.html", sitename=sitename, zones=sites)


@app.route("/zone/<zone>/update/",methods=["GET"])
@jwt_required
def update(zone):    
    token = get_jwt_identity()
    token ="token " + token
    headers = {"Authorization":token}
    e_id = str(request.args.get('e_id'))
    dis = str(request.args.get('dis'))
    total_vent_area = str(request.args.get('total_vent_area'))
    area = str(request.args.get('area'))
    height = str(request.args.get('height'))
    data = {'dis':dis,'e_id':e_id, 'height':height, 'total_vent_area':total_vent_area,'area':area}
    r = requests.put("https://app.envairo.com/api/zones/" + zone + "/",data=data, headers=headers)
    sites = []
    r = r.json()
    error = True
    for item in r:
        if item == 'e_id':
            error = False
    r['error']=error
    return jsonify(r)
    


@app.route("/configure/", methods=["GET","POST"])
@jwt_required
def configure():
    return render_template("index.html")

@app.route("/key/", methods=["POST"])
def key():
    return "a6089d2e93525a3a934a202d0ad9063b"


@app.route("/auth", methods=["GET","POST"])
def auth():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    r = requests.post("https://app.envairo.com/api/api-token-auth/",data={"username":username,"password":password})
    if 'token' in r.json():
        pctoken = r.json()['token']
        access_token = create_access_token(identity=pctoken)
        resp = jsonify({'login': True})
        set_access_cookies(resp, access_token)
        return resp, 200
    else:
        return jsonify({'login': False})
@app.route("/")    
@app.route("/login/", methods=["GET","POST"])
def login():
    return render_template("login.html", alert = "")

@app.errorhandler(401)
def page_not_found(e):
    return render_template('401.html'), 401



if __name__ == "__main__":
    app.debug = True
    app.run()

