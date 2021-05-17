const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req,res) => {
  res.json({msg:"upload page"});
})

router.post("/upload" , (req,res) => {
  // נאסוף את המידע של הקובץ
  // fileSend -> שם של הקיי שיכיל את הקובץ
  let fileInfo = req.files.fileSend
  // מוציא רק את הסיומת של הקובץ בשביל הבדיקה
  fileInfo.ext = path.extname(fileInfo.name); 
  // האפשרויות של הסיומות שאני מרשה לעלות - תמונות
  let allowExt_ar = [".jpg",".png",".gif",".svg",".jpeg"]
  if(fileInfo.size >= 5*1024*1024){
    return res.status(400).json({msg:"The file is too big, you can send to 5 mb"});
  }
  // בודק אם הסיומת של הקובץ נמצאת במערך של הסיומות שמורשות
  else if(!allowExt_ar.includes(fileInfo.ext)){
    return res.status(400).json({msg:"Error: stupid! You allowed to upload just images!"});
  }
  // מעלה את הקובץ
  fileInfo.mv("public/prods_images/"+fileInfo.name , function(err){
    if(err){  return res.status(500).json({msg:"Error: there problem try again later , or send files just in english charts only"});}
    // res.send(fileInfo);
    res.json({msg:"file upload success!"});

  })


})

module.exports = router;