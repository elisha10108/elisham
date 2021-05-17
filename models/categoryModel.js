const mongoose = require("mongoose");
const Joi = require("joi");


const categorySchema = new mongoose.Schema({
  s_id:Number,
  name:String,
  info:String
})

exports.CategoryModel = mongoose.model("categories",categorySchema);

exports.validCategory = (_bodyData) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(100).required(),
    info:Joi.string().min(2).max(500).allow(null, ''),
    s_id:Joi.number().min(1).max(999).required()
  })
  return joiSchema.validate(_bodyData);
}