import mysql from 'mysql2/promise'

export const db = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
    waitForConnections: 10,
    queueLimit: 0
})
