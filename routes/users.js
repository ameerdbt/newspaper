const router = require("express").Router();
const User = require("../models/User");
const Tweet = require("../models/Tweet")
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verify = require("./verifyToken");
const adminValid = require("./adminMiddleware");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

const regSchema = Joi.object({
  username: Joi.string().min(2).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
  admin: Joi.boolean().required(),
});

const logSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

router.post("/register", async (req, res) => {
  const { error } = regSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exist");

  const userExist = await User.findOne({ username: req.body.username });
  if (userExist) return res.status(400).send("username already exist");

  const hashPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
    admin: req.body.admin,
  });
  try {
    const userSaved = await user.save();
    res.json({ message: userSaved });
  } catch (error) {
    res.status(400).json({ message: "Account was not created" });
  }
});

router.post("/login", async (req, res) => {
  const { error } = logSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or Password is wrong");

  const validPass = bcrypt.compareSync(req.body.password, user.password);
  if (!validPass)
    return res.status(400).json({ message: "Email or Password is wrong" });

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);

  res.json({ message: "Logged in successful" });
});

router.get("/profile", verify, async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user);
  res.send(user);
});

router.patch("/password-reset/:id", verify, async(req,res)=>{
    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    try {
        const updatedUser = await  User.findByIdAndUpdate(req.params.id,{
            password: hashPassword
        }, {new: true})
        res.status(200).json({message: updatedUser})
    } catch (error) {
        res.status(400).json({message: "Password was not reset"})
    }
})

router.post("/follow/:id", verify, async(req,res)=>{
    try {
        const user = await User.findById(req.user)
         user.following.push(req.params.id)
        const savedFollow = await user.save()
       res.json({message: savedFollow})
    } catch (error) {
        res.status(400).json({message: error})
    }
})

router.get("/feed", verify, async(req,res) =>{
    try {
        const user = await User.findById(req.user)
        const feed = await Tweet.find({user : user.following[1]})
        res.send(feed)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

router.get("/admin", verify, adminValid, (req, res) => {
  if (req.isAdmin) {
    res.send("Welcome Admin");
  } else {
    res.send("Admin only");
  }
});

router.post("/admin/create", verify,adminValid, async (req, res) => {
    if(req.isAdmin)
    {

        const { error } = regSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
      
        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) return res.status(400).send("Email already exist");
      
        const userExist = await User.findOne({ username: req.body.username });
        if (userExist) return res.status(400).send("username already exist");
      
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
      
        const user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashPassword,
          admin: req.body.admin,
        });
        try {
          const userSaved = await user.save();
          res.json({ message: userSaved });
        } catch (error) {
          res.status(400).json({ message: "Account was not created" });
        }
    }
    else{
        res.json({message: "Admin Only!"})
    }
  });

router.patch("/admin/edit/:id", verify, adminValid, async(req,res) =>{
    try {
        const updatedUser = await  User.findByIdAndUpdate(req.params.id,{
            username: req.body.username
        }, {new: true})
        res.status(200).json({message: updatedUser})
    } catch (error) {
        res.status(400).json({message: "Edit was not successful"})
    }
})

router.delete("/admin/delete/:id", verify, adminValid, async(req,res)=>{
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        res.status(200).json({message: `${deletedUser} has successfully been deleted`})
    } catch (error) {
        res.status(400).json({message: "Delete was not successful"})
    }
})
module.exports = router;
