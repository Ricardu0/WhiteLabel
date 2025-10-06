import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST || "locadora-mysql.mysql.database.azure.com",
    user: process.env.DB_USER || "adminazure",
    password: process.env.DB_PASS || "SuaSenha@123",
    database: process.env.DB_NAME || "locadora",
    port: 3306,
    ssl: {
        rejectUnauthorized: true
    }
});

export default pool;
