const express = require("express");
const path = require("path");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { ProdModel, validProd, generateShortId } = require("../models/prodModel");

const router = express.Router();


router.get("/", async (req, res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
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
router.get("/all", async (req, res) => {
  try {
    let data = await ProdModel.find()
 
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.get("/count", async (req, res) => {

  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};
  try {
   
    let data = await ProdModel.countDocuments(filterCat)
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


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

router.get("/search" , async(req,res) => {
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
    
    await prod.save();
    res.status(201).json(prod);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})
router.post("/add", authToken,  async (req, res) => {
  let validBody = validProd(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let prod = new ProdModel(req.body);
    prod.user_id = req.userData._id;
    prod.s_id = await generateShortId()
   
    await prod.save();
    res.status(201).json(prod);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


router.put("/upload/:editId", authToken,  async (req, res) => {
  if (req.files.fileSend) {
    let fileInfo = req.files.fileSend;
   
    fileInfo.ext = path.extname(fileInfo.name);
    
    let filePath = "/prods_images/"+req.params.editId+fileInfo.ext;
    let allowExt_ar = [".jpg", ".png", ".gif", ".svg", ".jpeg"];
    if (fileInfo.size >= 5 * 1024 * 1024) {

      return res.status(400).json({ err: "The file is too big, you can send to 5 mb" });
    }
    else if (!allowExt_ar.includes(fileInfo.ext)) {
      return res.status(400).json({ err: "Error: stupid! You allowed to upload just images!" });
    }
    
    
    fileInfo.mv("public"+filePath , async function(err){
      if(err){  return res.status(400).json({msg:"Error: there problem try again later , or send files just in english charts only"});}


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
    req.body.user_id = req.userData._id;
    let data = await ProdModel.updateOne({ _id: editId }, req.body)
    res.status(201).json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})



router.put("/addcount/:editId", async (req, res) => {
  let editId = req.params.editId;
  let validBody = validProd(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
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
// TODO: just admin can add, delete and edit prod

module.exports = router;