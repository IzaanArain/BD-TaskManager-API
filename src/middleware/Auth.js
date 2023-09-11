const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const user_token_auth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const auth = await User.findOne({ userAuth:token });
    if (!token) {
      return res.status(401).send({
        status: 0,
        message: "must have a token",
      });
    }else if (auth?.userAuth !== token) {
      return res.status(401).send({
        status: 0,
        message: "token does not matched",
      });
    } else if (auth?.isBlocked === true) {
      return res.status(401).send({
        status: 0,
        message: `Dear ${auth?.name} your account is temporaray blocked`,
      });
    } else {
      const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
      req.id = decoded._id;
      next();
    }
  } catch (err) {
    res.status(500).send({ 
      status:0,
      Message:"Authentication failed",
      Error: err.message });
  }
};

module.exports = user_token_auth;
