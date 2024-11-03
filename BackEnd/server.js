const session = require('express-session');
const express = require('express');
const app = express();
const router = require('./router');


app.use(session({
    secret: "adsgdfsySDG152", // รหัสลับเพื่อรักษาความปลอดภัยของเซสชัน
    resave: false, // กำหนดว่าจะบันทึกเซสชันใหม่แม้ไม่ได้เปลี่ยนแปลงหรือไม่
    saveUninitialized: true})); // บันทึกเซสชันที่ยังไม่ได้เปลี่ยนแปลง

app.use(express.static('public'));

app.listen(4000,() => console.log('connected sucess post 4000'));
app.use('/',router);