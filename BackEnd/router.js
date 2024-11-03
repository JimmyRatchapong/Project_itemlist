const express = require('express');
const router = express.Router();
const mysql = require('mysql2');


router.use(express.json());
router.use(express.urlencoded({ extended:true})); //urlencoded = การเข้าถึงbodyหรือheader ของ web

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0942818331',
    database: 'testtmg',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 //รอคิวขอเชื่อมต่อกับ data base

});

// router.post('/login' , (req,res) => {
//     const {username,password} = req.body ; //รับหน้าหน้าล็อคอิน
//     const query = 'SELECT * FROM user WHERE username=?' //* คือเอามาทั้งหมด id,user,password FROM จากตารางชื่ออะไร WHERE คือ การกำหนดเงื่อนไข อันนั้คือต้องการ username
//     pool.query(query, [username], function(err, user) {  //pool.query คือการหาข้อมูลจาก database  username มาจากบรรทัด 21 แล้ว จะไปแทน ? ในบรรทัดที่22 ส่วน user คือตัวเก็บข้อมูลจากบรรทัด22
//         if(err) {
//             console.log(err);
//             return res.status(500).send(); //เกิด err หลายอย่างเช่น เชื่อมต่อไม่ได้
//         }

//         if(user.length > 0) {
//             const byUser = user[0];
//             if(password===user.password){
//             return res.status(200).send(); // sucess  
//             }
            
//         }
//         return res.status(404).send(); //หา user ไม่เจอ
        
//     })

// });

module.exports = router;

