import hashlib, sqlite3
db1 = "misc/database.db"
def checkLogin(username,password):
   # hashedPass = hashlib.sha1(password).hexdigest()
   # db = sqlite3.connect(db1)
   # c = db.cursor()
   # query = "SELECT * FROM users"
    dbUserPass = [['admin', 'd033e22ae348aeb5660fc2140aec35850c4da997']] #c.execute(query)
    for entry in dbUserPass:
        if (entry[0] == username):
            if (entry[1] == password): return ""
            else: return "Incorrect Password"
    return "Incorrect Username"
