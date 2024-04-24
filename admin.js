const { client } = require('./databasepg');

const checkRole = async (userEmail) => {
    try {
        const res = await client.query(
            `SELECT email, role, user_id FROM users WHERE email LIKE $1`, 
            [`%${userEmail}%`]
        );
        return res.rows[0];
    } catch (err) {
        console.error('Error in checkRole:', err);
        throw err;
    };
};

const createLobby = async (userEmail) => {
    try {
        const role = await checkRole(userEmail);
        if (role.role === 'admin') {
            await client.query(`INSERT INTO lobby (admin) VALUES ('${role.user_id}')`);
        } else {
            console.log('this user is not admin and is not allowed to create a lobby');
            res.send("this user is not admin and is not allowed to create a lobby")
        }
    } catch (err) {
        console.error('Error in createLobby:', err);
        throw err
    }
};

module.exports = { checkRole, createLobby };
