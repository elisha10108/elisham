const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { array, object } = require("joi");
const { join } = require("lodash");

let userSchema = new mongoose.Schema({
  name:String,
  email:String,
  pass:String,
  role:{
    type:String,default:"regular"
  },
  date_created:{
    type:Date, default:Date.now()
  },
  phone:String,
  address:String,
  avatarImg:String,
  comments:String,
  carts :Array
})

exports.UserModel = mongoose.model("shop_users",userSchema);

exports.validUser = (_bodyUser) => {
  // סכמה של הצד השרת ובעצם תתבצע בדיקה בצד שרת
  // שהמידע תקין לפני שנבצע עליו שאילתא במסד נתונים
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(100).required(),
    email:Joi.string().min(2).max(100).email().required(),
    pass:Joi.string().min(2).max(100).required(),
    phone:Joi.string().min(9).max(20).required(),
    address:Joi.string().min(2).max(200).allow(null, ''),
    avatarImg:Joi.string().min(2).max(200).allow(null, ''),
    // carts:Joi.array.allow(null,''),
  })
// אם יש טעות יחזיר מאפיין שיש בו אירור
  return joiSchema.validate(_bodyUser);
}


exports.validLogin = (_bodyUser) => {
// בדיקה בצד שרת בשביל הלוג אין שיש אימייל ופאס
// בPAYLOAD מהצד לקוח
  let joiSchema = Joi.object({
    email:Joi.string().min(2).max(100).email().required(),
    pass:Joi.string().min(2).max(100).required()
  })
// אם יש טעות יחזיר מאפיין שיש בו אירור
  return joiSchema.validate(_bodyUser);
}

exports.genToken = (_id) => {
  let token = jwt.sign({_id},"monkeysSecret",{expiresIn:"60mins"});
  return token;
}