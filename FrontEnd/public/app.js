// import express from "express";
// const app = express();
// app.use(express.static('public'));

function validate() {
     let username = document.getElementById('Username'); //getElementById รับค่า value จากช่อง username
     let password = document.getElementById('Password');
     let usernameError = document.querySelector("#Username_error"); //querySelector การเข้าถึงหรือหา element โดย id "ในบรรทัดนี้ element คือ span"
     let passwordError = document.querySelector("#Password_error");

      // var errorMessage = "";
    
     let isValid = true

      if (username.value == '') {
         usernameError.innerHTML = 'Please entry username'
         usernameError.style.color = 'red'
         username.style.border = '3px red solid'
         isValid = false
      } else {
         usernameError.style.color = 'black'
         username.style.border = '3px black solid'
      }

      if (password.value == '') {
         passwordError.innerHTML = 'Please entry password'
         passwordError.style.color = 'red'
         password.style.border = '3px red solid'
         isValid = false
      } else {
         passwordError.style.color = 'black'
         password.style.border = '3px black solid'
      }

      if (isValid == false) {
         return false
      }
   }

   ///////////////////////////////////////////////
function messageError () {
      const errorMessage = document.getElementById('error-message').dataset.error; // ใช้ dataset เพื่อเก็บค่าข้อผิดพลาด
   if (errorMessage) {
       document.getElementById('error-message').style.display = 'block';
       document.getElementById('error-message').innerText = errorMessage; // แสดงข้อความข้อผิดพลาด
   } else {
       document.getElementById('error-message').style.display = 'none'; // ซ่อนเมื่อไม่มีข้อผิดพลาด
   }
   }

   ///////////////////////////////////////////////
   function saveError () {
      const saveError = document.getElementById('save-error').dataset.error; // ใช้ dataset เพื่อเก็บค่าข้อผิดพลาด
      if (saveError) {
        document.getElementById('save-error').style.display = 'block';
        document.getElementById('save-error').innerText = saveError; // แสดงข้อความข้อผิดพลาด
      } else {
        document.getElementById('save-error').style.display = 'none'; // ซ่อนเมื่อไม่มีข้อผิดพลาด
      }
    }
   
   //////////////////////////////////////////////
   function logout() {
      // Redirect to the logout route or perform any other logout operation
      window.location.href = "/logout";
  }

  ////////////////////////////////////////
  function addItem() {
   console.log('addddd');
   window.location.href = "/additem";
  }

  /////////////////////////////////////////////////////////
  function saveItem() {
   console.log('saveeeee');
   window.location.href = "/save_additem";
  }

//////////////////////////////////////////////////
  function deleteItem(id) {
   // แสดงกล่องยืนยันการลบ
   if (window.confirm('Are you sure you want to delete this item?')) {
      // หากผู้ใช้คลิก OK ให้ไปยัง URL สำหรับลบรายการ
      console.log('Deleting item with ID:', id);
      window.location.href = `/deleteitem/${id}`;
  } else {
      // หากผู้ใช้คลิก Cancel
      console.log('Delete action canceled');
  }
}
//////////////////////////////////////////////
  function editItem(id) {
   console.log('EDITITEM');
   window.location.href = `/edititem/${id}`;
  }

////////////////////////////////////////////////////

  // รอให้ DOM โหลดเสร็จก่อนที่จะทำงาน
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // ตรวจสอบว่า DOM โหลดเสร็จหรือยัง

    // ตรวจจับการเปลี่ยนแปลงเมื่อผู้ใช้เลือกไฟล์รูปภาพ
    const imgInput = document.getElementById('img');
    
    if (imgInput) {
        console.log('Found element with ID "img"'); // ตรวจสอบว่าพบ element แล้ว
        imgInput.addEventListener('change', function(event) {
            const imageListDiv = document.getElementById('imageList');
            imageListDiv.innerHTML = '';  // เคลียร์รูปเก่าออกก่อน

            const file = event.target.files[0];  // รับไฟล์ที่เลือก
            if (file) {
                const reader = new FileReader();

                // เมื่อโหลดไฟล์เสร็จจะแสดงผลเป็นรูปภาพ
                reader.onload = function(e) {
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;  // กำหนด source ของรูปจาก FileReader
                    imgElement.style.width = '200px';  // กำหนดขนาดของรูป
                    imageListDiv.appendChild(imgElement);  // แสดงรูปใน div ที่เตรียมไว้
                }

                // เริ่มอ่านไฟล์เป็น data URL
                reader.readAsDataURL(file);
            }
        });
    } else {
        console.error("Element with ID 'img' not found."); // ข้อความแสดงความผิดพลาดเมื่อไม่พบ element
    }
});
//////////////////////////////////////////////////////////////

   //    if (errorMessage !== "") {
   //       document.getElementById("error-message").innerText = errorMessage;
   //       document.getElementById("error-message").style.display = "block";
   //       return false; // หยุดการส่งฟอร์ม
   //   }
   //   return true; // ส่งฟอร์มได้เมื่อการตรวจสอบสำเร็จ
   

// ฟังก์ชันสำหรับการแจ้งเตือนเมื่อ login ไม่สำเร็จจาก server
      // window.onload = function() {
      //    console.log('error');
         
      //    const params = new URLSearchParams(window.location.search);
      //    console.log('params',params);
         
      //    if (params.has('error')) {
      //       console.log('if error');
            
      //        const errorMessage = params.get('error');
      //        console.log(errorMessage);
             
      //        document.getElementById('error-message').innerText = decodeURIComponent(errorMessage);
      //        document.getElementById('error-message').style.display = 'block'; // แสดงข้อความแจ้งเตือน
      //    }
   
      // }

      // Function to get query parameters from the URL
   //    function getQueryParam(param) {
   //       const urlParams = new URLSearchParams(window.location.search);
   //       return urlParams.get(param);
   //   }

   
//      const errorMessage = "<%= typeof errorMessage !== 'undefined' ? errorMessage : '' %>";
//   if (errorMessage) {
//     document.getElementById('error-message').style.display = 'block';
//   }

   //   // Get the error message from the URL and display it
   //   const errorMessage = getQueryParam('error');
   //   if (errorMessage) {
   //       document.getElementById('error-message').textContent = decodeURIComponent(errorMessage);
   //       document.getElementById('error-message').style.display = 'block'; // แสดงข้อความแจ้งเตือน     
   //    }




      // alert("Login success");
      //   return true;

   //    function validate() {
   //       let username = document.getElementById('Username'); //getElementById รับค่า value จากช่อง username
   //       let password = document.getElementById('Password');
   //       let usernameError = document.querySelector("#Username_error"); //querySelector การเข้าถึงหรือหา element โดย id "ในบรรทัดนี้ element คือ span"
   //       let passwordError = document.querySelector("#Password_error");
 
   //   if (username.value =="" && password.value =="") {
   //      usernameError.innerHTML = "Please entry username" ;
   //      passwordError.innerHTML = "Please entry password" ;
   //      usernameError.style.color = "red";
   //      passwordError.style.color = "red";
   //      username.style.border = "3px red solid";
   //      password.style.border = "3px red solid";
   //      return false;
   //   }
 
   //   else if (username.value =="") {
   //      usernameError.innerHTML = "Please entry username" ;
   //      usernameError.style.color = "red" ;
   //      username.style.border = "3px red solid";
   //      password.style.border = "3px red solid";
   //      return false;
   //   }
 
   //   else if (password.value =="") {
   //      passwordError.innerHTML = "Please entry password" ;
   //      passwordError.style.color = "red" ;
   //      username.style.border = "3px red solid";
   //      password.style.border = "3px red solid";
   //      return false;
   //   }
   // }
     

    