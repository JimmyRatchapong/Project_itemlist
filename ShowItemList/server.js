import express from "express";
import bodyParser from "body-parser";
import { dirname, posix } from "path";
import { fileURLToPath } from "url";
import mysql from 'mysql2/promise';
import { name } from "ejs";
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//////////// ตั้งค่าให้ express ใช้ ejs เป็น view engine//////////////////////
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0942818331',
  database: 'testtmg',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 //รอคิวขอเชื่อมต่อกับ data base

});

////////////////// อ่านค่า itemlist////////////////////////////
app.get('/', async (req, res) => {
  // สมมุติว่าคุณมีตาราง "items" ในฐานข้อมูล
  const [items] = await pool.query('SELECT * FROM testtmg.itemlist');
  res.render('frontend', { items });

});

/////////////////////////////////////read detail/////////////////////////////////////
app.get('/detail/:id', async (req, res) => {
  
  const { id } = req.params;
  const query = 'SELECT * FROM testtmg.itemlist WHERE id = ?'

    try {
      // สมมุติว่าคุณมีตาราง "items" ในฐานข้อมูล
      const [items] = await pool.query(query, [id]);
      console.log('items' ,items);
      const item = items[0]; // ดึงรายการแรกจากอาร์เรย์
      console.log(item);
      res.render('detail', { item } );
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  
});

////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});