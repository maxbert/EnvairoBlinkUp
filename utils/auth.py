def checkLogin(username,password):
    hashedPass = password#hashlib.sha1(password).hexdigest()
    db = sqlite3.connect(db1)
    c = db.cursor()
    query = "SELECT * FROM users"
    dbUserPass = c.execute(query)
    for entry in dbUserPass:
        if (entry[0] == username):
            if (entry[1] == hashedPass): return ""
            else: return "Incorrect Password"
    return "Incorrect Username"
