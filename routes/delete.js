const { query,client, doQuery, selectEmail } = require('./../databasepg');
const { createLobby } = require('./../admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Client} = require('pg');
const SECRET_KEY = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const deleteMessageFromLobby = async (req, res) => {
    const { id, messageId } = req.params;
    const decodedToken = jwt.decode(req.token);
    try{
        jwt.verify(req.token, SECRET_KEY, (err, data) => {
            try{
                client.query('SELECT role FROM users WHERE email = $1', [decodedToken.email], (err, result) => {
                    if(result.rows[0].role === 'admin') {
                        client.query('DELETE FROM message WHERE id = $1', [messageId]);
                        res.send(`Message with id ${messageId} was deleted.`);
                    } else {
                        console.log("This user isn't allowed to make changes")
                        res.status(405).send("This user isn't allowed to make changes");
                    }
                });
            } catch(err) {
                throw err;
            }
        });
    } catch(err) {
        throw err;
    };
};

module.exports = { deleteMessageFromLobby };