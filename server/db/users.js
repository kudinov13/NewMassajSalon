const nanoid = require("nanoid");
const {getDb} = require("./db");
const md5 = require('md5');

const TABLE_NAME = "users";

module.exports = {
    TABLE_NAME,
    addUser: async (login, password, fullName, phone, email) => {
        // первый зарегистрированный пользователь становится админом
        const countRow = await getDb().get(`SELECT COUNT(*) AS cnt FROM ${TABLE_NAME}`);
        const isAdmin = countRow && countRow.cnt === 0 ? 1 : 0;
        const newUser = {
            login,
            password: md5(password),
            isAdmin,
            fullName: fullName || '',
            phone: phone || '',
            email: email || ''
        };
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (login, password, isAdmin, fullName, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
            newUser.login, newUser.password, newUser.isAdmin, newUser.fullName, newUser.phone, newUser.email
        );
        newUser.id = result.lastID;
        return newUser;
    },
    getUsers: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),
    getUserByLogin: async (login) => await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE login = ?`, login),
    getUserById: async (id) => await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id),
};
