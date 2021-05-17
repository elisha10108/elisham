const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema({
  user_id:String,
  // נשמור א המערך כסטרינג
  carts_ar:String,
  total:Number,
  status:{
    type:String , default:"pending"
  },
  invoide_id:String,
  date_created:{
    type:Date, default:Date.now()
  },
  comments:String
})


exports.CartModel = mongoose.model("carts", cartSchema);

exports.validCart = (_bodyData) => {
  let joiSchema = Joi.object({
    carts_ar:Joi.string().min(2).max(9999).required(),
    total:Joi.number().min(1).max(999999).required()
  })

  return joiSchema.validate(_bodyData);
}
