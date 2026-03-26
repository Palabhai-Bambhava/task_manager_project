const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  company: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Company",
  required: true,
},

  permissions:{
    create:{type:Boolean,default:false},
    read:{type:Boolean,default:true},
    update:{type:Boolean,default:false},
    delete:{type:Boolean,default:false}
  },

  isActive:{
    type:Boolean,
    default:true
  }

},
{timestamps:true}
);

module.exports = mongoose.model("Role",roleSchema);