const mongoose= require("mongoose");
let projectSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    projLanguage:{
        type: String,
        required:true,
        enum:["python", "java", "javascript", "cpp","c","Go","Bash"]
    },
    code:{
        type:String,
        required:true,
    },
    createdBy:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default: Date.now,
    }

});
module.exports=mongoose.model("Project", projectSchema); //Project is name of collection