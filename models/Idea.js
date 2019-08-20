/* 设计数据库类型 */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IdeaSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  details:{
    type:String,
    required:true
  },
  user:{
    type: String,
    required:false
  },
  date:{
    type:Date,
    default: Date.now
  }
})

mongoose.model('ideas',IdeaSchema);