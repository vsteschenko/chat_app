const { query,client, doQuery, selectEmail } = require('./../databasepg');
const { createLobby } = require('./../admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Client} = require('pg');
const SECRET_KEY = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const sign = promisify(jwt.sign)

const writeMessage = async(req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const decodedToken = jwt.decode(req.token);
    const userId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email])
    try{
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if(err) {
                res.status(403).send('пердёж')
            } else {
                query(`INSERT INTO message (lobby_id, user_id, text) VALUES ($1, $2, $3) RETURNING *`, [id, userId, text]);
                res.send(`${decodedToken.email} published a message`);
            }
        })
    } catch(err) {
        res.status(500).send('Internal Server Error')
        throw err
    }
};

const addUser = async(req, res) => {
    const { id } = req.params;
    const decodedToken = jwt.decode(req.token);
    const { newUserEmail, newUserPassword, newUserRole } = req.body;
    const userId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email]);
    try{
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if(err) {
                res.status(403).send('пердёж')
            } else {
                //check whether the current user is admin or not
                client.query('SELECT role FROM users WHERE user_id = $1', [userId], async(req, result) => {
                    if(result.rows[0].role === 'admin') {
                        // register
                        const salt = await bcrypt.genSalt();
                        const hashedPassword = await bcrypt.hash(newUserPassword, salt);
                        //Save user's data in DB
                        client.query(`INSERT INTO users (email, password, role, lobby_id) VALUES ($1, $2, $3, $4)`,[newUserEmail, hashedPassword, newUserRole, id], (err, result) => {
                            if(!err) {
                                res.send(`New user ${newUserEmail} has been regisetered`);
                            } else {
                                console.log(err)
                                throw err
                            }
                        });
                    } else {
                        res.send("You aren't admin")
                    }
                })
            }
        })
    } catch(err) {
        res.status(500).send('Internal Server Error')
        throw err
    }
};

const directMessage = async(req, res) => {
    const { userEmail } = req.params;//кому отправляю
    const { text } = req.body; //сообщение
    const decodedToken = jwt.decode(req.token);
    const receiverId = await query('SELECT user_id FROM users WHERE email = $1',[userEmail]);
    const senderId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email]);
    try {
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if (err) {
                res.status(403).send('пердёж')
            } else {
                client.query(`INSERT INTO private_messages (user_id, text, sender_id, email) VALUES ($1, $2, $3, $4)`, [receiverId, text, senderId, decodedToken.email]);
                res.status(200).send('Direct message sent');
            }
        })
    } catch(err) {
        console.log(err);
        throw err;
    }
};

const register = async(req, res) => {
    try {
        //salt's necessary to encrypt/hash. Try logging salt and hashed password multiple times.
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //Save user's data in DB
        doQuery(req.body.email, hashedPassword, req.body.role);
        res.status(201).json({
            "congratulations": "you've successfully registered"
        });
    } catch(err) {
        res.status(500).send('пердёж');
        throw err;
    }
};

const login = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Invalid request, check your email and password');
    }
    try {
        const selectedEmail = selectEmail(email);
        if (!selectedEmail) {
            return res.status(400).send("Can't find user. Please register.")
        }
        const queryToSelectPassFromDb = await client.query(`SELECT password, user_id, email, role FROM users WHERE email LIKE $1`, [email]);
        if(queryToSelectPassFromDb.rows.length == 0) {
            return res.status(400).send("Can't find user");
        };
        const selectedPassword = queryToSelectPassFromDb.rows[0].password;
        const comparePasswords = await bcrypt.compare(password, selectedPassword);
        if(comparePasswords) {
            //Issue a jwt token
            const token = await sign({ 
                user_id: queryToSelectPassFromDb.rows[0].user_id,
                email: queryToSelectPassFromDb.rows[0].email,
                role: queryToSelectPassFromDb.rows[0].role
            }, SECRET_KEY, { algorithm: 'HS512', expiresIn: '1h' });
            res.json({ 
                permission: 'allowed',
                token: token
            })
        } else {
            return res.send({ 'permission status': 'denied' })
        }
    } catch(err) {
        res.status(500).send('Internal Server Error')
        throw err;
    }
};

const createNewLobby = async(req, res) => {
    jwt.verify(req.token, SECRET_KEY, (err,data) => {
        if(err) {
            res.status(403).send('пердёж')
        } else {
            const decodedToken = jwt.decode(req.token);
            createLobby(decodedToken.email);
            res.send("You created new lobby")
        }
    })
};

const joinLobby = async(req, res) => {
    const { id } = req.params;
    //find id of the user and pass it to a query
    const decodedToken = jwt.decode(req.token);
    jwt.verify(req.token, SECRET_KEY, (err, data) => {
        if(err) {
            res.status(403).send('пердёж')
        } else {
            //add a user to a lobby
            client.query(`UPDATE users SET lobby_id = '${id}' WHERE email LIKE $1`, [decodedToken.email], (err, result) => {
                    if (!err) {
                        console.log('DB updated');
                    } else {
                        console.log(err);
                        throw err;
                    }
                }
            );
            res.send(`${decodedToken.email} joined ${id} lobby.`);
        }
    })
};

const createNewLobbyAndPostMessage = async(req, res) => {
    jwt.verify(req.token, SECRET_KEY, async(err,data) => {
        if(err) {
            res.status(403).send('пердёж')
        } else {
            const decodedToken = jwt.decode(req.token);
            createLobby(decodedToken.email);
            try {
                const result = await client.query(`SELECT lobby_id FROM users WHERE email LIKE $1`, [decodedToken.email]);
                const lobbyId = result.rows[0].lobby_id;
                console.log('DB updated');
                await client.query(`INSERT INTO message (lobby_id, user_id, text) VALUES ($1, $2, $3)`, [lobbyId, decodedToken.user_id, `${decodedToken.email} created lobby`]);
                res.send(`${decodedToken.email} created lobby`);
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
    })   
};


module.exports = { writeMessage, addUser, directMessage, register, login, createNewLobby, joinLobby, createNewLobbyAndPostMessage };  