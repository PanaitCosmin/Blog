import mysql from "mysql2"; // ✅ Use "mysql2" (not "mysql2/promise")
import { createRequire } from "module";

export const dbconn = await mysql.createConnection({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
  });
  
  async function connectToDb() {
    try {
      await dbconn.connect()
    } catch (err) {
      return err
    }
  }

export default connectToDb
// const require = createRequire(import.meta.url); // ✅ CommonJS workaround

// const MySQLStore = require("express-mysql-session"); // ✅ Use require()

// export const dbPool = mysql.createPool({
//     host: process.env.HOST_DB,
//     user: process.env.USER_DB,
//     password: process.env.PASSWORD_DB,
//     database: process.env.DB,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

// // ✅ Fix: Pass a config object instead of `dbPool` directly
// const sessionStoreOptions = {
//     expiration: 86400000, // 1 day
//     createDatabaseTable: true,
//     schema: {
//         tableName: "sessions",
//         columnNames: {
//             session_id: "session_id",
//             expires: "expires",
//             data: "data",
//         },
//     },
// };

// // ✅ Fix: Use `dbPool.promise()` instead of `dbPool` directly
// export const sessionStore = new MySQLStore(sessionStoreOptions, dbPool.promise());
