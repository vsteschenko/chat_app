const pg = require('pg');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const limitter = require('express-rate-limit');
require('dotenv').config();
const { client, doQuery, selectEmail, query} = require('./databasepg');
const { ensureToken } = require('./jwt');
const { promisify } = require('util');
const { checkRole, createLobby } = require('./admin');
const { writeMessage, addUser, directMessage, register, login, createNewLobby, joinLobby } = require('./routes/post');
const { getUsers, getLobbyMessages, getDms, getMyPrivateMessages } = require('./routes/get');
const { editMessage } = require('./routes/patch');
const { deleteMessageFromLobby } = require('./routes/delete');
const cors = require('cors');

const app = express();
// app.use(cors({
//   origin: '*', // Allow all origins
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json());
// app.use(
//     limitter({
//     windowMs: 5000,
//     max: 10
// }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

app.get('/lobby/:id/users', ensureToken, getUsers); 
app.get('/lobby/:id/messages', ensureToken, getLobbyMessages); 
app.get('/lobby/:id/myMessages', ensureToken, getDms);
app.get('/myMessages', ensureToken, getMyPrivateMessages);
app.get('/info', (req, res) => {
    res.json({message:"Hello Arakis!"})
});

app.post('/register', register);
app.post('/login', login);
app.post('/createLobby', ensureToken, createNewLobby);
app.post('/lobby/:id/join', ensureToken, joinLobby);
app.post('/lobby/:id/writeMessage', ensureToken, writeMessage);
app.post('/lobby/:id/addUser', ensureToken, addUser);
app.post('/directMessage/:userEmail', ensureToken, directMessage);


app.patch('/lobby/:id/myMessages/:messageId', ensureToken, editMessage)


app.delete('/lobby/:id/myMessages/:messageId', ensureToken, deleteMessageFromLobby);


app.listen(process.env.PORT || PORT);