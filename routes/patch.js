const { query,client, doQuery, selectEmail } = require('./../databasepg');
const { createLobby } = require('./../admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Client} = require('pg');
const SECRET_KEY = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const editMessage = async(req, res) => {
    const { id, messageId } = req.params;
    const { text } = req.body;
    const decodedToken = jwt.decode(req.token);
    const userId = await query('SELECT user_id FROM users WHERE email = $1',[decodedToken.email]);
    try{
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            if(err) {
                res.status(403).send('пердёж')
            } else {
                // first i need to check role
                client.query('SELECT role FROM users WHERE email = $1', [decodedToken.email], (err, result) => {
                    if (result.rows[0].role === 'admin') {
                        // this is for admin
                        client.query("UPDATE message SET text = $1 WHERE id = $2", [text, messageId], (err, result) => {
                            if(!err) {
                                res.send(result.rows);
                            } else {
                                console.log(err)
                            }
                        })
                    } else {
                        // this is for user
                        client.query(`UPDATE message SET text = $1 WHERE id = $2 AND user_id = $3`, [text, messageId, userId], (err, result) => {
                            if (!err) {
                                res.send(result.rows);
                            } else {
                                console.log(err)
                                return false
                            }
                        })
                    }
                });
            }
        });
    } catch(err) {
        res.status(500).send('Internal Server Error')
        throw err;
    }
};

module.exports = { editMessage };