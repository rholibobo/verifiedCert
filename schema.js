const mongoose = require('mongoose');
const moment = require("moment");
// require('mongoose-moment')(mongoose);

mongoose.connect('mongodb://0.0.0.0:27017/certDB');



const coursesSchema = new mongoose.Schema({
  courseTitle: String,
  date:{
    type: String,
    default: moment().format("MMMM Do YYYY")
  }
})

const customList = new mongoose.Schema({
  name: String,
  course: [coursesSchema],
  email: String,
  date:{
    type: String,
    default: moment().format("MMMM Do YYYY")
  }
  
})

exports.Item = mongoose.model('item', coursesSchema);
exports.certifiedUser = mongoose.model('certifiedUser', customList);

