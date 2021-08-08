const mongoose = require("mongoose");
const Joi = require("joi");
const {random} = require("lodash");
const { string } = require("joi");

const prodSchema = new mongoose.Schema({
  name:{type:String, default:""},
  info:String,
  img:String,
  price:{type:Number, default:0},
  qty:Number,
  category_s_id:Number,
  tags:String,
  s_id:Number,
  date_created:{
    type:Date, default:Date.now()
  },
  user_id:String,
  comments:String,
  count:{type:Number, default:0},
  type:String
})

exports.ProdModel = mongoose.model("prods",prodSchema);


exports.validProd = (_bodyData) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(100).required(),
    info:Joi.string().min(2).max(500).allow(null, ''),
    img:Joi.string().max(500).allow(null, ''),
    price:Joi.number().min(1).max(999999).required(),
    qty:Joi.number().min(1).max(999999).required(),
    category_s_id:Joi.number().min(1).max(999999).required(),
    tags:Joi.string().max(500),
    comments:Joi.string().max(500).allow(null, ''),
    type:Joi.string().max(20).required(),
    count:Joi.number().allow(null,''),
  })

  return joiSchema.validate(_bodyData);
}


// פונקציה שמייצרת מספר רנדומלי עד 6 ספרות
// בשביל לייצר איידי קצר
exports.generateShortId = async () => {
  let rnd;
  // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף מוצר אחר
  let okFlag = false;
  
  // while(okFlag == false){
  while(!okFlag){
    rnd = random(1,999999);
    let data = await this.ProdModel.findOne({s_id:rnd});
    // במידה והדאטא לא נמצא זה אומר שאין איי די כזה לאף
    // מוצר והוא יצא המלופ ויחזיר את המספר הרנדומלי
    if(!data){
      okFlag = true;
    }
  }
  return rnd;
}