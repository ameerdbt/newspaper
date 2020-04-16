const User = require("../models/User")

module.exports = async(req, res, next)=>{
    const user = await User.findById(req.user._id)
    if(!user) return res.send("User does not exist")
    
    if(user.admin === false){
        req.isAdmin = false
    }else{
        req.isAdmin = true
    }
    next()

}