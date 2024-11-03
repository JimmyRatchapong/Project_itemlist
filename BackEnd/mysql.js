//แบคเอน ขอเชื่อมข้อมูลกับ mysql ดังนี้

const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0942818331',
    database: 'testtmg',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 //รอคิวขอเชื่อมต่อกับ data base

});

module.exports = pool.promise();