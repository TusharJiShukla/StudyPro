const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("DB connection successful"))
    .catch((error)=>{
        console.log("DB Connection Failed");
        console.log(error);
        process.exit(1);
    })
}