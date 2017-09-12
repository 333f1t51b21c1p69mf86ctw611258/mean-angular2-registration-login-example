const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const profileSchema = new Schema({
  name: { type: String, required: true, unique : true },
  description: { type: String },
  blackIps: [{
    blackIp: String,
    description: String
  }]
});


module.exports = mongoose.model('Profile', profileSchema);
