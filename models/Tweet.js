const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    min: 2,
    max: 140,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Tweet", tweetSchema);
