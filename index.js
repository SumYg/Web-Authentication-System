const express = require('express')
const app = express()
const mariadb = require('mariadb')
const session = require('express-session')
const dotenv = require('dotenv').config()
const bcrypt = require('bcrypt')
const {
    createHash,
} = require('crypto');
const secureParameter = 11
const email = require('./email')


const pool = mariadb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 267840
      }
}))

app.get('/auto-mail', async (req, res) => {
    if (req.session.loggedIn === true) {
        // console.log(`{email: ${req.session.email}}`)
        try {
            let emailInfo = await email.sendEmail(req.session.email)
            // console.log(emailInfo)
            res.send({emailSent: true})
        } catch (err) {
            res.send({emailSent: false, error: err})
        }
        // console.log(emailReturnMessage)
        // res.status(200).send(emailReturnMessage)
    } else {
        res.status(200).send("Please Login First")
    }
    // email.sendEmail()
})

app.get('/check', (req, res) => {
    // console.log("check", req.session)
    // console.log(req.session.userID, req.session.loggedIn, req.session.username)
    if (req.session.loggedIn === true) {
        res.json({loginStatus: true, userID: req.session.userID, username: req.session.username}) // -------------
    } else {
        res.json({loginStatus: false})
    }
})

app.get('/logout', (req, res) => {
    // console.log(`user logging out ${req.session.userID} ${req.session.loggedIn}`)
    req.session.destroy()
    res.status(200).send()
})

app.post('/register', async function (req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        const accrows = await conn.query((`select id from users.accs where account = '${req.body.account}'`));        
        // console.log(accrows)
        // console.log("Record", accrows[0])
        if (accrows[0] !== undefined) {
            // console.log("Duplicate acc and password reject this registration")
            res.status(200).send("Duplicate account")
            return
        } 
        const emailrows = await conn.query((`select id from users.accs where email = '${req.body.email}'`));
        if (emailrows[0] !== undefined) {
            res.status(200).send("Duplicate email")
            return 
        }
        const digest = await bcrypt.hash(req.body.password, secureParameter)
        await conn.query(`insert into users.accs (account, email, password) values ('${req.body.account}', '${req.body.email}', '${digest}');`);
        res.status(201).send()
    
      } catch (err) {
            res.status(200).send(err)
      } finally {
        if (conn) conn.release(); //release to pool
        // console.log(req.session)
      }
})

app.post('/login', async function (req, res) {
    let conn, userid, authenticate;
    // console.log(req.session)
    if (!req.session.loggedIn) {
        req.session.loggedIn = false
    }

    if (req.session.loggedIn === false) {
        try {
            // console.log(req.body.account)
            conn = await pool.getConnection();
            const rows = await conn.query((`select id, password, email from users.accs where account = '${req.body.account}'`));

            if (rows[0] !== undefined) {
                // console.log("--------------", rows.length)
                element = rows[0]
                if (rows.length > 1) {
                    // console.log("Duplicate acc and password")
                    res.status(500).send("Duplicates in db")
                    return 
                }

                
                if (rows.length === 1 && await bcrypt.compare(req.body.password, element['password'])) {
                    authenticate = true
                    userid = element["id"]
                    req.session.userID = userid
                    req.session.username = req.body.account
                    req.session.loggedIn = true
                    req.session.email = element['email']
                    // console.log("USER Email:",req.session.email)
                } else {
                    authenticate = false
                }
            }

        
          } catch (err) {
              console.log(err)
            throw err;
          } finally {
            if (conn) conn.release(); //release to pool
            // console.log(req.session)
          }
          
    } else {
        authenticate = true
    }
    if (authenticate) {
        res.json({loginSucc: 1, userID: req.session.userID})
      } else {
          res.json({loginSucc: 0})
      }
});

app.post('/insertDoc', async function (req, res) {
    let conn;
    try {
        // const digest = await bcrypt.hash(req.body.docId, secureParameter)
        const sha256 = createHash('sha256').update(req.body.docId).digest('hex')
        // console.log(sha256)
        conn = await pool.getConnection();
        const rows = await conn.query(`INSERT INTO documents.docs VALUES ('${req.body.docId}', '${sha256}')`);        
        // console.log(accrows)
        // console.log("Record", accrows[0])
        // if (rows[0] !== undefined) {
            // console.log("Duplicate acc and password reject this registration")
            // res.status(200).send("Duplicate account")
            // return
        // } duplicate will throw an error since hash is the unique key in the DB
        res.status(201).send()
    
      } catch (err) {
            console.log(err)
            res.status(200).send(err)
      } finally {
        if (conn) conn.release(); //release to pool
        // console.log(req.session)
      }
})

app.get('/doc', async (req, res) => {
    let conn
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`select id from documents.docs where hash = '${req.query.secret}'`);
        // console.log(req.query.secret)
        if (rows[0] === undefined) {
            res.send({err: 2})
            return
        }
        res.send({err: 0, id: rows[0].id})
    } catch (err) {
        console.log(err)
        res.send({err: 1, errMessage: err})
    } finally {
        if (conn) conn.release(); //release to pool
    }
})

app.listen(8000, () => {
    console.log("Login authentication listening on Port 8000");
})
