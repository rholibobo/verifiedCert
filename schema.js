const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/certDB');

const coursesSchema = new mongoose.Schema({
  courseTitle: String
})
const customList = new mongoose.Schema({
  name: String,
  course: [coursesSchema],
  email: String
})

exports.Item = mongoose.model('item', coursesSchema);
exports.certifiedUser = mongoose.model('certifiedUser', customList);