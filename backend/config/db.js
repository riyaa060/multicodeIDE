const mongoose= require("mongoose");

const connectDB= async ()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/codeIDE",{
useNewUrlParser: true,
useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    }
    catch (error)
    {
        console.error("Error in database connection:", error  )  }
};

module.exports= connectDB;


