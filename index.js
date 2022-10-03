const express = require("express");
const moment = require("moment");
const fs = require("fs");
const _ = require("lodash");
const pdfDoc = require("pdfkit");
const mongoose = require("mongoose");
const QRCode = require('qrcode');
// const base64ToImage = require('base64-to-image');
const { resolve } = require("path");
const itemModel = require(`${__dirname}/schema.js`);

const CertCollection = itemModel.certifiedUser;
const Item = itemModel.Item;

const port = 5000;
const app = express();

//Middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');


const doc = new pdfDoc({
  layout: "landscape",
  size: "A4",
});


app.post('/test', (req, res)=>{
  const fname = _.capitalize(req.body.fName);
  const lname = _.capitalize(req.body.lName);
  const course = _.toUpper(req.body.course);
  const email = _.toLower(req.body.email);

  const qrfileName = fname + lname + course;
  const qrFileLower = _.toLower(qrfileName);
  const name = fname + " " + lname;
  const namePdf = fname + " " + lname + " " +course + " Certificate";


  const con = new Item({
    courseTitle: course
  })
 

  CertCollection.findOne({name: name}, (err, respo)=>{
    if(!err){
      // console.log(respo);
      if(!respo){
        console.log("The List does not exist");
        const userAdd = new CertCollection({
          name: name,
          course: con,
          email: email
        })
        userAdd.save((err, result)=>{
          const verify1 = `https://certverify.capacitybay.org/${result.course[0].id}`;
          saveFile(qrFileLower, verify1);
          setTimeout(saveCert, 2000, name, verify1, qrFileLower, course, namePdf);
        });
        
  
        // res.redirect("/")
      } else{
        console.log("The List Exists");
        
        const found = respo.course.some(el => el.courseTitle === course);
          if (!found) {
            respo.course.push(con);
            respo.save();
            for(let i = 0; i < respo.course.length; i++){
              if(respo.course[i].courseTitle === course){

                const verify = `https://certverify.capacitybay.org/${respo.course[i].id}`;
                saveFile(qrFileLower, verify);
                setTimeout(saveCert, 2000, name, verify, qrFileLower, course, namePdf);
              }
            }
          }

      }
      
      
    }else{
      console.log("There is an Error");
    }
  });

// Finalize the PDF and end the stream
// async function main(){
//   await saveFile();
//   await qw();
// }
// main();
res.redirect("/");
// res.sendFile(`${__dirname}${name}.pdf`);
})

// base64ToImage(base64Str,path,optionalObj)


//Save Certificate 

function saveCert(name, verify, qrFileLower, course, namePdf){
  doc.pipe(fs.createWriteStream(`${namePdf}.pdf`));

  // Draw the certificate image
  doc.image("public/img/cert3.jpg", 0, 0, { width: 842 });
  
  
  //Remember to download the font
  // Set the font to Dancing Script
  doc.font("fonts/Poppins-ExtraBold.ttf");
  
  // Draw the name
  doc.fontSize(35).text(name, 50, 295, {
      align: "center"
  });
  doc.fontSize(53).text(course, 50, 190, {
      align: "center"
  });
  
  doc.font("fonts/Poppins-Medium.ttf");
  const ver = "Issued on: ";
  const who = " | Issued by: CapacityBay";
  
  
  qw(qrFileLower);

  // Draw the date
  doc.fontSize(12).text(ver + moment().format("MMMM Do YYYY") + who, 20, 491, {
      align: "center"
  });
  
  doc.fontSize(12).text(verify, 20, 505, {
      align: "center",
      link: verify
  });
  doc.end();
}




//Generate QRcode and save
function saveFile(qrFileLower, url){
    QRCode.toFile(`qr/${qrFileLower}.png`,url, function (err) {
      if(err){
        console.log("error")
      }else{
        console.log("Saved");
      }
    
  });
}


//Draw on the QRcode
function qw(qrFileLower){
    doc.image(`qr/${qrFileLower}.png`, 30, 450, {fit: [100, 100], align: "left"})
   .rect(320, 15, 100, 100)
}



//Home Get Route
app.get('/', (req, res)=>{
  res.render("home");
});



app.listen(port, ()=> console.log(`Server running at port ${port}`));