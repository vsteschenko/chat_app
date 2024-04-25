const {Client} = require('pg');

const client = new Client({
    host: process.env.DATABASE_URL,
    user: "slavasito",
    port: 5432,
    password: "q4J@Sxe5$!%QXd",
    database: "lobby"
});

client.connect();

const doQuery = (val1, val2, val3) => {
    client.query(
        `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)`,[val1, val2, val3], (err, res) => {
        if(!err) {
            console.log('DB updated');
            // client.end();
        } else {
            console.log(err)
        }
    });
};

const selectEmail = async (userEmail) => {
    // Must use parameters in a query to prevent SQL injections
    client.query(`SELECT email FROM users WHERE email LIKE $1`, [userEmail], (err, result) => {
            if (!err) {
                // return res.rows[0].email;
                return true;
            } else {
                return false;
            }
        }
    );
};

const query = async (query,value) => {
    return new Promise((resolve, reject) => {
        client.query(query,value,(error,results) => {
            if(error) {
                reject(error);
            } else {
                //console.log(results.rows[0].user_id);
                resolve(results.rows[0].user_id)
            }
        })
    }
)};

module.exports = { client, doQuery, selectEmail, query };