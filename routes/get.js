const { query,client, doQuery, selectEmail } = require('./../databasepg');
const { createLobby } = require('./../admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Client} = require('pg');
const SECRET_KEY = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const getUsers = async(req, res) => {
    const { id } = req.params;
    jwt.verify(req.token, SECRET_KEY, (err, data) => {
        if(err) {
            res.status(403).send('пердёж')
        } else {
            client.query(`SELECT email FROM users WHERE lobby_id = $1`, [id], 
            (err, result) => {
                if (!err) {
                    res.send(result.rows);
                } else {
                    console.log(err)
                    return false
                }
            })
        }
    })
};

const getLobbyMessages = async(req, res) => {
    const { id } = req.params;
    jwt.verify(req.token, SECRET_KEY, (err, data) => {
        if(err) {
            res.status(403).send('пердёж')
        } else {
            //get all messages from this lobby
            try {
                client.query(`SELECT text FROM message WHERE lobby_id = $1`, [id], 
                (err, result) => {
                    if (!err) {
                        res.send(result.rows);
                    } else {
                        console.log(err)
                        return false
                    }
                })
            } catch(err) {
                console.log("There're no publications yet.")
                res.status(500).send()
            }
        }
    })
};

const getDms = async(req, res) => {
    const decodedToken = jwt.decode(req.token);
    const userId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email]);
    console.log(userId);
    try{
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if(err) {
                res.status(403).send('пердёж')
            } else {
                client.query(`SELECT id, text FROM message WHERE user_id = $1`, [userId], 
                (err, result) => {
                    if (!err) {
                        res.send(result.rows);
                    } else {
                        console.log(err)
                        return false
                    }
                })
            }
        });
    } catch(err) {
        res.status(500).send('Internal Server Error')
        throw err;
    }
};

const getMyPrivateMessages = async(req, res) => {
    // const { email } = req.body;
    const decodedToken = jwt.decode(req.token);
    const userId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email]);
    try {
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if (err) {
                res.status(403).send('пердёж')
            } else {
                client.query(`SELECT email, text from private_messages WHERE user_id = $1`, [userId], (err, result) =>{
                    if(err) {
                        console.log(err);
                        throw err
                    } else {
                        res.status(200).send(result.rows);
                    }
                } );
            }
        })
    } catch(err){
        res.status(500).send('Internal Server Error');
        throw err;
    }
};

module.exports = { getUsers, getLobbyMessages, getDms, getMyPrivateMessages };