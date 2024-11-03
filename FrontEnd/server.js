import express from "express";
import bodyParser from "body-parser";
import { dirname, posix } from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import mysql from 'mysql2/promise';
import fs from 'fs';
import { name } from "ejs";
import path from 'path';  // แก้ไข: เพิ่มการ import โมดูล path
import multer from 'multer';
// const mysql = require('mysql2');

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3002;

app.use(express.static(__dirname + '/public'));
// app.use(express.static('public'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

var userIsAuthorised = false;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'sadasd486',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }

}));


//////////// ตั้งค่าให้ express ใช้ ejs เป็น view engine//////////////////////
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

///////////////// mysql //////////////////////////////////////
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0942818331',
    database: 'testtmg',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 //รอคิวขอเชื่อมต่อกับ data base

});


///////////////////////อ่านค่าหน้า login///////////////////////
app.get("/", (req, res) => {
  res.redirect('/login');
  // res.sendFile(__dirname + "/login.html");
});

app.get("/login", (req, res) => {
  if (req.session.userIsAuthorised) {
    res.redirect('/itemlist');
    // res.sendFile(__dirname + "/itemlist.html");
  } else {
    res.render('login', { error: null }); // ส่งค่า error เป็น null หากไม่มีข้อผิดพลาด
    // res.sendFile(__dirname + "./views/login.ejs");
    // res.redirect('/login');
  }
});


////////////////////////// เข้า login////////////////////////////////////////
app.post('/login', async (req, res) => {
  const { Username, Password } = req.body; // รับข้อมูลจากฟอร์มล็อกอิน
  const query = 'SELECT * FROM user WHERE username=?'; // คำสั่ง SQL เพื่อหา username,* คือเอามาทั้งหมด id,user,password FROM user จากชื่อตารางอะไร WHERE คือ การกำหนดเงื่อนไข อันนั้คือต้องการ username

  try {
    const [rows] = await pool.query(query, [Username]); // ใช้ await เพื่อรอคำสั่ง query เสร็จสิ้น pool.query คือการหาข้อมูลจาก database ,Username มาจากบรรทัด 94 แล้ว จะไปแทน ? ในบรรทัดที่95

    if (rows.length > 0) {
      const user = rows[0];

      // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
      if (Password === user.password) {  // สมมติว่าฟิลด์รหัสผ่านคือ "password" ในฐานข้อมูล
        req.session.userIsAuthorised = true;
        req.session.username = Username; // เก็บชื่อผู้ใช้ในเซสชัน
        return res.redirect('/itemlist'); // เปลี่ยนเส้นทางไปยังหน้า itemlist
      
      } else {
        const errorMessage = 'Invalid password';
        console.log(errorMessage);
        return res.render('login', { error: errorMessage });
      }

    } else {
      const errorMessage = 'Undefined account';
      console.log(errorMessage);
      return res.render('login', { error: errorMessage });
    }

  } catch (err) {
    console.error(err);
    return res.redirect('/login'); // เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลหรือการ query
  }
});


////////////////////////////////read_pageadditem///////////////////////////////
app.get('/additem', (req,res) => {
  if (req.session.userIsAuthorised) {
    console.log('additem');
    // เมื่อไม่มีข้อผิดพลาด ส่งค่า error เป็นค่าว่าง
    res.render('additem', { error: '' });
    // res.render('additem');
  } else {
    res.render('login', { error: null });
}});


////////////////////////////////////////// อ่านค่า itemlist//////////////////////////////////
app.get('/itemlist', async (req, res) => {
  if (req.session.userIsAuthorised) {
    try {
      // สมมุติว่าคุณมีตาราง "items" ในฐานข้อมูล
      const [items] = await pool.query('SELECT * FROM testtmg.itemlist');
      res.render('itemlist', { items });
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  } else {
    res.redirect('/');
  }
});


///////////////////////////////// กำหนดที่เก็บไฟล์รูปภาพ////////////////////////////////
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');  // กำหนดโฟลเดอร์ที่ต้องการเก็บรูป
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // ดึงนามสกุลไฟล์จากชื่อไฟล์ต้นฉบับ
    cb(null, Date.now() + ext);  // ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกันโดยใช้เวลา (timestamp) บวกนามสกุลไฟล์
  }
});

const upload = multer({ storage: storage });


////////////////////////////////////additem///////////////////////////////////////////
app.post('/save_additem', upload.single('img'), async (req, res) => {
  // Check if the user is authorized
  if (!req.session.userIsAuthorised) {
    return res.redirect('/');
  }
  
  const { name, description } = req.body;
  const img = req.file ? req.file.filename : null; // ตรวจสอบว่ามี req.file หรือไม่ null คือ ค่าว่าง

  // การตรวจสอบ: ตรวจสอบว่ามีฟิลด์ใดว่างหรือไม่
  if (!name || !description || !img) {
    let saveAddError ='';
    
    // ปรับข้อความแสดงข้อผิดพลาดตามฟิลด์ที่ขาดหายไป
    if (!img && !description && !name) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล img, description, และ name';
    } else if (!name && !description) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล name กับ description';
    } else if (!img && !name) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล img กับ name';
    } else if (!img && !description) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล img กับ descriptio';
    } else if (!name) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล name';
    } else if (!description) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล description';
    } else if (!img) {
      saveAddError = 'Save Add Error: กรุณากรอกข้อมูล img';
    }
    
    return res.render('additem', { error: saveAddError });
  }

  // Here you can insert the data into the database, for example:
  const query = 'INSERT INTO testtmg.itemlist (img, name, description) VALUES (?, ?, ?)';
  try {
    await pool.query(query, [img, name, description]); // Assuming `pool` is your MySQL connection pool
    res.redirect('/itemlist'); // Redirect to item list page after adding
  } catch (error) {
    console.error('Error inserting item:', error);
    res.status(500).send('Error inserting item');
  }
});


/////////////////////////////////////read edit/////////////////////////////////////
app.get('/edititem/:id', async (req, res) => {
  if (!req.session.userIsAuthorised) {
    console.log('GetEditItem');
    return res.redirect('/');
  }
  const { id } = req.params;
  const query = 'SELECT * FROM testtmg.itemlist WHERE id = ?'

    try {
      // สมมุติว่าคุณมีตาราง "items" ในฐานข้อมูล
      const [items] = await pool.query(query, [id]);
      console.log('items' ,items);
      const item = items[0]; // ดึงรายการแรกจากอาร์เรย์
      console.log(item);
      // ส่งข้อมูล item และ error (ที่เป็นค่าว่าง) ไปยังหน้า EJS
      res.render('edititem', { item, error: '' });
      // res.render('edititem', { item } );
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  
});


////////////////////////////////////edit////////////////////////////////////////////
app.post('/save_edititem/:id', upload.single('img'), async (req, res) => {
  console.log('saveitemlist');
  if (!req.session.userIsAuthorised) {
    return res.redirect('/');
  }

  const { id } = req.params;
  console.log('id',id);
  // const { img, name, description } = req.body;
  const { name, description } = req.body;
  const img = req.file ? req.file.filename : req.body.existingImage; // หากไม่มีไฟล์ใหม่ ให้ใช้รูปเดิม , ? คือ มีมาไหม ถ้ามี req.file.filename ถ้าไม่มี req.body.existingImage "คือ if else แบบสั้น"
  console.log('Updating item with ID:', id);

  // การตรวจสอบ: ตรวจสอบว่ามีฟิลด์ใดว่างหรือไม่
  if (!name || !description || !img) {
    let saveEditError = '';
    
    // ปรับข้อความแสดงข้อผิดพลาดตามฟิลด์ที่ขาดหายไป
    if (!img && !description && !name) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล img, description, และ name';
    } else if (!name && !description) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล name กับ description';
    } else if (!img && !name) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล img กับ name';
    } else if (!img && !description) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล img กับ descriptio';
    } else if (!name) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล name';
    } else if (!description) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล description';
    } else if (!img) {
      saveEditError = 'Save Edit Error: กรุณากรอกข้อมูล img';
    }

        // ดึงข้อมูล item จากฐานข้อมูลอีกครั้ง
    const query = 'SELECT * FROM testtmg.itemlist WHERE id = ?';
    const [items] = await pool.query(query, [id]);
    const item = items[0]; // ดึงรายการแรกจากอาร์เรย์
    
    // ส่งข้อมูลกลับไปยังหน้า edititem พร้อมกับ error
    return res.render('edititem', { item, error: saveEditError });
  }

  const query = 'UPDATE testtmg.itemlist SET img = ?, name = ?, description = ? WHERE id = ?';

  try {
    await pool.query(query, [img, name, description, id]);
    res.redirect('/itemlist'); // หลังจากอัปเดตเสร็จสิ้น กลับไปยังหน้ารายการ
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});


///////////////////////////delete//////////////////////////////////
app.get('/deleteitem/:id', async (req, res) => {
  console.log('deleteitem');

  // Check if the user is authorized
  if (!req.session.userIsAuthorised) {
    return res.redirect('/');
  }
  const  { id }  = req.params; // Get the item ID from URL parameters ,แยก id ที่ส่งมาพร้อม partURL ,ที่ต้องใส่ {} เพราะเราจะเอามาแค่ตัวเลข id
  console.log('Item ID to delete:', id); // ตรวจสอบว่ามีค่า id ที่ถูกต้อง
  // SQL query to delete the item
  const query = 'DELETE FROM testtmg.itemlist WHERE id = ?';

  try {
    // Execute the query to delete the item based on the provided ID
    await pool.query(query, [id]);
    res.redirect('/itemlist'); // Redirect to item list page after deletion
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});


/////////////////////////////logout session/////////////////////////////////////
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.redirect('/');
  });
});


////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

////////////////////////////////////////////////////////

// function checkLogin(Username,Password) {
//   return Username === 'admin' && Password === '1234';
// }

// ของเก่า
// function checkLogin(req, res, next) {
//   console.log("checklogin");
  
//   if (req.method === 'POST' && req.url === '/login') { 
//     console.log("post method");
//     console.log(req.body.Username);
    
//     const { Username, Password } = req.body;
//     console.log('const Username',Username); 
    
//     if (Username === 'admin' && Password === '1234') {
//       console.log("if adim user");
      
//       req.session.userIsAuthorised = true;
//       req.session.username = Username; // Store the username in the session
//       // req.session.password = Password; // Store the password in the session (not recommended for security reasons)
//       // const password = req.body["Password"];
//       // const username = req.body["Username"];
//     } else {
//       console.log("else");
      
//       req.session.userIsAuthorised = false;
//     }
// }

  
//   next();
// }

// //check function
// app.use(checkLogin);



// app.post('/login' , async (req,res) => {
//   const {Username,Password} = req.body ; //รับหน้าหน้าล็อคอิน
//   const query = 'SELECT * FROM user WHERE username=?' //* คือเอามาทั้งหมด id,user,password FROM จากตารางชื่ออะไร WHERE คือ การกำหนดเงื่อนไข อันนั้คือต้องการ username
//   await pool.query(query, [Username], function(err, user) {  //pool.query คือการหาข้อมูลจาก database  username มาจากบรรทัด 21 แล้ว จะไปแทน ? ในบรรทัดที่22 ส่วน user คือตัวเก็บข้อมูลจากบรรทัด22
//       if(err) {
//           console.log(err);
//           res.redirect('/login'); // เปลี่ยนเส้นทางไปที่หน้าเข้าสู่ระบบ
//           // return res.status(500).send(); //เกิด err หลายอย่างเช่น เชื่อมต่อไม่ได้
//       }

//       if(user.length > 0) {
//           const byUser = user[0];
//           if(Password===user.Password){
//             req.session.userIsAuthorised = true;
//             req.session.username = Username; // เก็บชื่อผู้ใช้ในเซสชัน
//             res.redirect('/itemlist'); // เปลี่ยนเส้นทางไปยังรายการสิ่งของ
//           // return res.status(200).send(); // sucess  
//           }
          
//       } else {
//       res.redirect('/login'); // เปลี่ยนเส้นทางไปที่หน้าเข้าสู่ระบบ
//       // return res.status(404).send(); //หา user ไม่เจอ
//       }
//   })

// });

// app.post('/login', (req, res) => {
//   const { Username, Password } = req.body;

//   if (checkLogin(Username, Password)) {
//     req.session.userIsAuthorised = true;
//     req.session.username = Username; // เก็บชื่อผู้ใช้ในเซสชัน
//     res.redirect('/itemlist'); // เปลี่ยนเส้นทางไปยังรายการสิ่งของ
//   } else {
//     res.redirect('/login'); // เปลี่ยนเส้นทางไปที่หน้าเข้าสู่ระบบ
//   }
// });

//ของเก่า
// app.post('/login', (req, res) => { //เอาเช็ค ueser pass มาไว้ในนี้
//   if (req.session.userIsAuthorised) {
//     res.redirect('/itemlist');
//     // res.sendFile(__dirname + "/itemlist.html");
//   } else {
//     res.redirect('/login');
//   }
// });



//ปกติ
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/login.html");
// });

// app.post("/login", (req, res) => {
//   console.log('login');
  
//   if (userIsAuthorised) {
//     res.sendFile(__dirname + "/page2.html");

//   } else {
//     res.sendFile(__dirname + "/login.html");
//     //Alternatively res.redirect("/");
//   }
// });

//logout ปกติ
// app.get('/logout', (req, res) => {
// res.redirect('/');
// });

// let button = document.querySelector(".logout-button");
// button.addEventListener("click",function() {
// res.redirect('/');
// });