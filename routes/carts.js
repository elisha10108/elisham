const express = require("express");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { validCart, CartModel } = require("../models/cartModel");

const router = express.Router();

router.get("/", (req,res) => {
  res.json({msg:"carts work"});
})

router.get("/singleCart/:cartId", authToken, authAdminToken ,async(req,res) => {
  let cartId = req.params.cartId;
  try{
    let data = await CartModel.findOne({_id:cartId});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(400).send(err)
  }
})

router.get("/allCarts", authToken, authAdminToken ,async(req,res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 100;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
  // בודק אם נשלח קווארי סטרינג של קטגוריה ואם לא יהיה ריק אם כן יעשה פילטר של קטגוריה
  // ?cat=
  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};

  try {
    // filter -> זה השאילתא
    let data = await CartModel.find(filterCat)
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

router.post("/", authToken, async(req,res) => {
  let validBody = validCart(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    // בודקים אם יש רשומה במצב פנדינג עם איי די 
    // של המשתמש אם אין נייצר חדש אם קיים נעדכן
    let cartData = await CartModel.findOne({user_id: req.userData._id , status:"pending"});
    // נמצא ולכן יעודכן
    if(cartData){
      let data = await CartModel.updateOne({_id:cartData._id},req.body);
      return res.json(data);
    }
    // לא נמצא ולכן נייצר רשומה חדשה
    let newData = new CartModel(req.body);
    newData.user_id = req.userData._id;
    //TODO: send email to the shop owner and maybe also to customer
    await newData.save();
    return res.status(201).json(newData);
  }
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

// משנה את הסטטוס של הקארט אם הושלם , פנדינג או בוטל
router.patch("/status/:idCart", authToken, authAdminToken , async(req,res) => {
  if(!req.body.status){
    return res.status(400).json({msg:"You must send status in body"});
  }
  try{
    // TODO: add date been updated
    let data = await CartModel.updateOne({_id:req.params.idCart},req.body);
      return res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

module.exports = router;