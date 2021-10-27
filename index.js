const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const jwtGenerator = require("./jwtGenerator");
const authorization = require('./authorization');

require('dotenv').config();

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

// To support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
// To parse cookies from the HTTP Request
app.use(cookieParser());

app.use((req, res, next) => {
    // Get auth token from the cookies
    const authToken = req.cookies['AuthToken'];

    // Inject the user to the request

    next();
});

// Our requests hadlers will be implemented here...

app.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = getHashedPassword(password);
        const user = await pool.query("SELECT * FROM users WHERE username=$1 AND password=$2",
            [username, hashedPassword]);
        if (user.rowCount !== 0) {
            const token = jwtGenerator(user.rows[0].user_id);
            res.json({ token });
            res.status(200);
            console.log("Found user");
        }
        else {
            console.log("No user");
            res.status(401).json("Wrong name or password");
        }
        res.send();
    } catch (error) {
        console.error(error.message);
    }
});

app.get("/is-verify", authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
})

app.get('/page1', authorization, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT username FROM users WHERE user_id=$1", [req.user]
        );
        res.json(user.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

app.get('/iban', authorization, async (req, res) => {
    try {
        const viewIban = await pool.query(
            "SELECT iban FROM racun WHERE user_id=$1", [req.user]
        );
        res.json(viewIban.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

app.get('/balance', authorization, async (req, res) => {
    try {
        const balance = await pool.query(
            "SELECT stanje FROM racun WHERE user_id=$1", [req.user]
        );
        res.json(balance.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

app.post('/transakcije',async (req,res)=>{
    const {transIme}=req.body;
    try {
        const userIbanGet= await pool.query("SELECT iban FROM racun INNER JOIN users ON racun.user_id=users.user_id WHERE username=$1", [transIme]);
        userIban=userIbanGet.rows[0].iban;
        const transactions = await pool.query("SELECT trans_id,iban_primatelj,suma,datum FROM transakcije WHERE iban_primatelj=$1 OR iban_posiljatelj=$1", [userIban]);
        if(transactions.rows.length===0){
            res.sendStatus(404);
        }
        res.json(transactions.rows);
    } catch (error) {
        console.error(error.message);
    }

});

app.post('/uplata',async (req, res) => {
    const { iban, value, password,uplatitelj } = req.body;
    try {
        const intValue=Number(value);
        const user2 = await pool.query("SELECT * FROM racun WHERE iban=$1", [iban]);
        if (user2.rows.length === 0) {
            res.sendStatus(404);
        } else {
            const dbQuery= await pool.query("SELECT * FROM racun INNER JOIN users ON racun.user_id=users.user_id WHERE username=$1", [uplatitelj]);
            if(getHashedPassword(password)!==dbQuery.rows[0].password){
                res.sendStatus(402);
            }
            const dbQuery1= await pool.query("SELECT * FROM racun WHERE iban=$1",[iban]);
            const dbQuery1Value=dbQuery1.rows[0].stanje;
            const dbQueryValue=dbQuery.rows[0].stanje;
            if(dbQueryValue<value){
                res.sendStatus(403)
            }
            const dbQuery2 = await pool.query("UPDATE racun SET stanje=$1 WHERE iban=$2 RETURNING *", [dbQuery1Value+intValue,iban]);
            const dbQuery3 = await pool.query("UPDATE racun SET stanje=$1 WHERE iban=$2 RETURNING *", [dbQueryValue-intValue,dbQuery.rows[0].iban]);
            console.log("Balance updated");
            const dbQuery4= await pool.query("INSERT INTO transakcije (iban_primatelj,iban_posiljatelj,suma,datum) VALUES($1,$2,$3,current_timestamp)",[iban,dbQuery.rows[0].iban,value]);
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error.message);
    }
});

app.post('/registerpage', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists
        const user = await pool.query("SELECT * FROM users WHERE username=$1",
            [username]);
        if (user.rowCount !== 0) {
            res.sendStatus(401);
            return;
        } else {
            const hashedPassword = getHashedPassword(password);
            // Store user into the database if you are using one
            const newUser = await pool.query("INSERT INTO users (username,password) VALUES($1,$2) RETURNING *",
                [username, hashedPassword]);
            let iban = Math.random().toFixed(15).split('.')[1];
            const newRacun = await pool.query("INSERT INTO racun (iban,user_id,stanje) VALUES($1,$2,$3)",
                [iban, newUser.rows[0].user_id, Math.floor(Math.random() * (1000-100+1)) + 100]);
            //Generate JWT token
            const token = jwtGenerator(newUser.rows[0].user_id);
            res.json({ token });
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error.message);
    }

});

app.listen(5000, () => console.log("Server started"));