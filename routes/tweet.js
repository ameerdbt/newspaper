const router = require("express").Router();
const User = require("../models/User");
const Tweet = require("../models/Tweet")
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verify = require("./verifyToken")
const adminValid = require("./adminMiddleware")

const tweetSchema = Joi.object({
    content: Joi.string().min(2).required().max(140),

  });

  router.get("/",verify, async (req,res) =>{
    try {
        const tweets = await Tweet.find().populate("user")
        // const tweets = await Tweet.find({user:req.user})
        res.send(tweets)
    } catch (error) {
        res.status(400).json({message: error});
    }
  })


  
  router.post("/new",verify, async (req,res) =>{
    const { error } = tweetSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const tweet = new Tweet({
        content : req.body.content,
        user: req.user
    })
    try {
        const tweetSaved = await tweet.save()
        res.send(tweetSaved)
    } catch (error) {
        res.status(400).json({message: "Tweet was not sent"});
    }

  })

  router.delete("/:id", verify, adminValid, async(req,res)=>{
      if(req.isAdmin){
          try {
              const deletedTweet = await Tweet.findByIdAndDelete(req.params.id)
              res.status(200).json({message: `${deletedTweet.content} has successfully been deleted`})
          } catch (error) {
              res.status(400).json({message: "Delete was not successful"})
          }

      }
      else{
          res.json({message: "Admin Only!"})
      }
  })

  module.exports =router