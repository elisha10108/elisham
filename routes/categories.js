const express = require("express");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { CategoryModel, validCategory } = require("../models/categoryModel");

const router = express.Router();

router.get("/", async(req,res) => {
  try{

    let data = await CategoryModel.find({}).sort({_id:-1});
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// get info about single category like name and info
router.get("/single/:idCategory", async(req,res) => {
  let idCategory = req.params.idCategory;
  try{

    let data = await CategoryModel.findOne({s_id:idCategory}).sort({_id:-1});
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})
router.get("/singleCat", async(req,res) => {
  try{

    let data = await CategoryModel.find();
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


router.post("/", authToken,authAdminToken, async(req,res) => {
  let validBody = validCategory(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let category = new CategoryModel(req.body);
 
   // console.log(category.s_id);
    await category.save();
    res.status(201).json(category);
  } 
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

router.put("/:editId", authToken,authAdminToken, async(req,res) => {
  let editId = req.params.editId;
  let validBody = validCategory(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{

    let data = await CategoryModel.updateOne({_id:editId},req.body)
    res.status(201).json(data);
  } 
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

router.delete("/:idDel", authToken , authAdminToken, async(req,res) => {
  let idDel = req.params.idDel;
  try{
    let data = await CategoryModel.deleteOne({_id:idDel});
    res.json(data);
    //TODO: delte all prods with the id of the category
  }
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

module.exports = router;

// 10:51