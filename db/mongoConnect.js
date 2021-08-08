const mongoose = require('mongoose');
const {config} = require("../config/secretData");
mongoose.connect(`

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("mongo connect");
});


module.exports = db;