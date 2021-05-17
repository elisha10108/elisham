const express = require("express");
const path = require("path");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { ProdModel, validProd, generateShortId } = require("../models/prodModel");

const router = express.Router();

// מחזיר רשימה של המוצרים עם יכולת להציג פר עמוד
// מספר עמוד, מיון לפי , ואם יש רברס
router.get("/", async (req, res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
  // בודק אם נשלח קווארי סטרינג של קטגוריה ואם לא יהיה ריק אם כן יעשה פילטר של קטגוריה
  // ?cat=
  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};

  try {
    // filter -> זה השאילתא
    let data = await ProdModel.find(filterCat)
      .sort({ [sortQ]: ifReverse })
      .limit(perPage)
      .skip(page * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// ראוט שמחזיר כמה מוצרים יש לי וגם יכול לתת כמה מוצרים יש מקטגוריה מסויימת
router.get("/count", async (req, res) => {
  // ?cat=3
  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};
  try {
    // filter -> זה השאילתא
    let data = await ProdModel.countDocuments(filterCat)
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// get one product by it id
router.get("/single/:id", async (req, res) => {
  try {
    let data = await ProdModel.findOne({ _id: req.params.id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.get("/search/" , async(req,res) => {
  let searchQ = req.query.q;
  let searchRexExp = new RegExp(searchQ,"i");

  try{
    let data = await ProdModel.find({$or:[{name:searchRexExp},{info:searchRexExp},{tags:searchRexExp}]})
    .limit(20);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


// route for add new product
router.post("/", authToken, authAdminToken, async (req, res) => {
  let validBody = validProd(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let prod = new ProdModel(req.body);
    prod.user_id = req.userData._id;
    prod.s_id = await generateShortId()
    // console.log(prod.s_id);
    await prod.save();
    res.status(201).json(prod);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

// מעלה קובץ אחרי שקיים כבר מוצר
router.put("/upload/:editId", authToken, authAdminToken, async (req, res) => {
  if (req.files.fileSend) {
    let fileInfo = req.files.fileSend;
    // אוסף סיומת
    fileInfo.ext = path.extname(fileInfo.name);
    // מגדיר את המיקום של הקובץ למסד נתונים ולהעלאה
    let filePath = "/prods_images/"+req.params.editId+fileInfo.ext;
    let allowExt_ar = [".jpg", ".png", ".gif", ".svg", ".jpeg"];
    if (fileInfo.size >= 5 * 1024 * 1024) {
      // ...prod -> מעבירים את המידע של הפרוד כי רק הקובץ לא עלה
      return res.status(400).json({ err: "The file is too big, you can send to 5 mb" });
    }
    else if (!allowExt_ar.includes(fileInfo.ext)) {
      return res.status(400).json({ err: "Error: stupid! You allowed to upload just images!" });
    }
    
    // מיטודה שמעלה את הקובץ
    fileInfo.mv("public"+filePath , async function(err){
      if(err){  return res.status(400).json({msg:"Error: there problem try again later , or send files just in english charts only"});}

      // update the db with the new file
      let data = await ProdModel.updateOne({ _id: req.params.editId }, {img:filePath});
      res.json(data);
  
    })
  }
  else{
    res.status(400).json({msg:"need to send file if image"})
  }
})

router.put("/:editId", authToken, authAdminToken, async (req, res) => {
  let editId = req.params.editId;
  let validBody = validProd(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // מכיוון שכל אדמין יכול לערוך , אז נרצה לעדכן את האיי די
    // של היוזר האדמין האחרון שנגע במוצר
    req.body.user_id = req.userData._id;
    let data = await ProdModel.updateOne({ _id: editId }, req.body)
    res.status(201).json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

router.delete("/:idDel", authToken, authAdminToken, async (req, res) => {
  let idDel = req.params.idDel;
  try {
    let data = await ProdModel.deleteOne({ _id: idDel });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})
//TODO: PUT EDIT
// TODO: just admin can add, delete and edit prod
// 14:50
module.exports = router;