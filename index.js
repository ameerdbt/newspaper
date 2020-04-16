const express = require('express')
const mongoose = require('mongoose')
const usersRoute = require("./routes/users")
const tweetRoute = require("./routes/tweet")
const cors = require("cors")
require("dotenv").config()
const app = express()



app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", usersRoute)
app.use('/tweet', tweetRoute)



app.get("/", (req,res)=>{
    console.log("Welcome to the Home page")
    res.send("Welcome to the Home page")
})

mongoose.connect(
    "mongodb://127.0.0.1:27017",
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("connected to db");
    }
    );
  
app.listen(3000, ()=>{
    console.log("Server connect at 3000")
})