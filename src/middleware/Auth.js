const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const user_token_auth = async (req, res, next) => {

  const token = req.headers["authorization"]?.split(" ")[1];

  const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
  // console.log("decoded:", decoded._id);
  req.id = decoded._id;
  
  const auth = await User.findOne({ _id :  req.id });
  
  try {
    if (!token) {
      res.status(400);
      throw new Error("token does not exist,must have a token");
    } else if (auth?.userAuth !== token) {
      res.status(400);
      throw new Error("token does not matched");
    } else if (auth?.isBlocked === true) {
      res.status(400);
      throw new Error(`Dear ${auth?.name} your account is temporaray blocked`);
    }
   
    next();
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.send({ Error: err.message });
  }
};

module.exports = user_token_auth;
