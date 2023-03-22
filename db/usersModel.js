const mongoose = require("mongoose");

var usersSchema = new mongoose.Schema({
  email: String
});

module.exports = mongoose.model('Users', usersSchema);