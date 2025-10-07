import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST || "server-bd-cn1.mysql.database.azure.com",
    user: process.env.DB_USER || "useradmin",
    password: process.env.DB_PASS || "admin@123",
    database: process.env.DB_NAME || "rickveiculos",
    port: 3306,
    ssl: {
        rejectUnauthorized: true
    }
});

export default pool;
