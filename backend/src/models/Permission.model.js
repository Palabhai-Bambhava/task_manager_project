const mongoose=require("mongoose");
 const permissionSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    value:{
        type:String,
        required:true,
        unique:true,
    },
    status:{
        type:Boolean,
        default:true,
    },


 },
    {timestamps:true});

module.exports=mongoose.model("permission",permissionSchema);   



