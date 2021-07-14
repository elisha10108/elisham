const express = require("express");

const router = express.Router();

router.get("/", (req,res) => {
  res.json({msg:"index work! 3333"});
})

module.exports = router;