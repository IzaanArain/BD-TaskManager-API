const Users = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//Create Token function
const createToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.SECRET_TOKEN, { expiresIn: "1d" });
};

//@desc get all user
//@route GET /api/v1/users/
//@access Private
const getAllUsers = async (req, res) => {
  const { id } = req;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("invalid user id, no such user exists");
    }
    if (!id) {
      res.status(404);
      throw new Error("you must be login to view users");
    }
    const userCheck = await Users.findById(id);
    if (!userCheck) {
      res.status(404);
      throw new Error("User not found");
    }
    if (userCheck?._id.toString() !== id.toString()) {
      res.status(403);
      throw new Error("you is not authorized view this user");
    }
    const user = await Users.find({}).sort({ createdAt: -1 });
    // res.status(200).send(user);
    const userMap = user.map(
      ({ name, email, phone, createdAt, updatedAt }) => ({
        name,
        email,
        phone,
        createdAt,
        updatedAt,
      })
    );
    // console.log(userMap);
    res.status(200).send(userMap);
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.send({ Error: err.message });
  }
};

//@desc get a user
//@route GET /api/v1/users/:id
//@access Private
const getUser = async (req, res) => {
  // const { id } = req.params;
  const { id } = req;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("invalid user id");
    }
    const user = await Users.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user?._id.toString() !== id.toString()) {
      res.status(403);
      throw new Error("you is not authorized view this user");
    }

    return res.status(200).send({
      status: 1,
      message: "user successfully fetched",
      user,
    });
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.send({ Error: err.message });
  }
};

//@desc add a user
//@route POST /api/v1/users/create
//@access public

const addUser = async (req, res) => {
  try {
    const { email: typed_email, password: typed_password } = req.body;
    if (!typed_email) {
      console.error("Error:", "please enter your email".red);
      return res.status(404).send({
        status: 0,
        message: "please enter your email",
      });
    } else if (!typed_email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        status: 0,
        message: "Please enter a valid email",
      });
    } else if (!typed_password) {
      return res.status(404).send({
        status: 0,
        message: "please enter your pasword",
      });
    } else if (
      !typed_password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      return res.status(404).send({
        status: 0,
        message:
          "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    }
    //check if user exists
    const userExists = await Users.findOne({ email: typed_email });
    if (userExists) {
      return res.status(404).send({
        status: 0,
        message: "user email is already registered, use another email",
      });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(typed_password, salt);

    // OTP code
    const otp_code = Math.floor(Math.random() * 900000) + 100000;
    // user is created in db
    const user = await Users.create({
      email: typed_email,
      password: hashedPassword,
      code: otp_code,
    });

    const { code, email } = user;
    return res.status(200).send({
      status: 1,
      message: "user OTP created successfully",
      data: { code, email },
    });
  } catch (err) {
    console.error("User OTP not created");
    console.log("Error:", err.message);
    return res.status(500).send({
      status: 0,
      message: "User OTP not generated",
    });
  }
};

//@desc OTP verification
//@route POST /api/v1/users/otp_verify
//@access private
const otp_verify = async (req, res) => {
  try {
    console.log(req.files)
    const { code:otp_code } = req.body;
    const lowest = 100000;
    const highest = 999999;
    if (!otp_code) {
      return res.status(404).send({
        status: 0,
        message: "please enter OTP code",
      });
    } else if (otp_code < lowest) {
      console.error(
        "Error",
        "OTP code must have six digits, cannot be lower than six digits".red
      );
      return res.status(404).send({
        status: 0,
        message:
          "OTP code must have six digits,cannot be lower than six digits",
      });
    } else if (otp_code > highest) {
      console.error(
        "Error",
        "OTP code must have six digits, cannot be higher than six digits".red
      );
      return res.status(404).send({
        status: 0,
        message:
          "OTP code must have six digits,cannot be higher than six digits",
      });
    }

    const user = await Users.findOne({ code: otp_code });
    if (!user) {
      console.error("Error", "user does not exist".red);
      return res.status(404).send({
        status: 0,
        message: "user does not exist",
      });
    }
    const { code, email } = user;
    res.status(200).send({
      status: 1,
      message: "user OTP successfully verified",
      data: { code, email },
    });
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    console.error("msg","Not a valid OTP code".red);
    return res.status(500).send({
      status: 0,
      message: "Not a valid OTP code",
    });
  }
};

//@desc complete profile
//@route POST /api/v1/users/complete_profile
//@access private
const Complete_profile = async (req, res) => {
  try {
    const {name,phone,email}=req.body
    if(!name){
      console.error("Error","Must have a user Name".red)
      return res.status(400).send({
        status:0,
        message:"Must have a user Name"
      });
    }else if(name.length>50){
      console.error("Error","Name can not be more th 50 character".red)
      return res.status(400).send({
        status:0,
        message:"Name can not be more th 50 character"
      });
    }else if (!phone){
      console.error("Error","must have phone a number".red)
      return res.status(400).send({
        status:0,
        message:"must have phone a number"
      });
    }else if(!phone.match(/^[0-9]{11}$/)) {
      console.error("Error","Phone number must have 11 digits".red)
      return res.status(400).send({
        status:0,
        message:"Phone number must have 11 digits"
      });
    }

    const userExists=await Users.findOne({email})
    if(!userExists){
      console.error("Error","user does not exist".red)
      return res.status(400).send({
        status:0,
        message:"user does not exist"
      });
    }
    const image=req?.file?.path?.replace(/\\/g,"/");
    const user=await Users.findOneAndUpdate(
      {email},
      {name,phone,image:image},
      {new:true}
    )
    res.status(200).send({
      status: 1,
      message: "Profile Completed Successfully",
      user
    })
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Profile Not complete",
    });
  }
};

//@desc login a user
//@route POST /api/v1/users/login
//@access Private
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      console.error("Error", "please enter email".red);
      return res.status(404).send({
        message: "please enter email",
        status: 0,
      });
    }else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      console.error("Error", "not a valid Email".red);
      return res.status(404).send({
        message: "not a valid Email",
        status: 0,
      });
    }else if (!password) {
      console.error("Error", "please enter password".red);
      return res.status(404).send({
        message: "please enter password",
        status: 0,
      });
    }else if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      console.error("Error", "not a valid password".red);
      return res.status(400).send({
        message: "not a valid password",
        status: 0,
      });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send({
        message: "user does not exist",
        status: 0,
      });
    }

    //compare password with hashed password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).send({
        message: "Incorrect password",
        status: 0,
      });
    }
    //create token
    const token = createToken(user?._id);

    //save token by updating userAuth in user
    const save_token = await Users.findByIdAndUpdate(
      { _id: user?._id?.toString() },
      { userAuth: token },
      { new: true }
    ).select("-password"); // removes password or any other key 

    if (user) {
      res.status(200).send({
        message: "login successful",
        status: 1,
        user: save_token,
      });
    } else {
      res.send({
        message: "Login failed",
        status: 0,
      });
    }
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      Error: err.message,
    });
  }
};

//@desc forgot password
//@route POST /api/v1/users/forget_password
//@access Public
const forget_password=async(req,res)=>{
  try{
    const {email:typed_email}=req.body;
    if(!typed_email){
      console.error("Error","please enter email");
      return res.status(404).send({
        status:1,
        message:"please enter email"
      }) 
    }else if (!typed_email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      console.error("Error", "not a valid Email".red);
      return res.status(404).send({
        message: "not a valid Email",
        status: 0,
      });
    }

    const userExists=await Users.findOne({email:typed_email})
    if(!userExists){
      console.error("Error", "user does not exist".red);
      return res.status(404).send({
        message: "user does not exist",
        status: 0,
      });
    }

     // OTP code
     const otp_code = Math.floor(Math.random() * 900000) + 100000;

     const user=await Users.findOneAndUpdate(
      {email:typed_email},
      {code:otp_code},
      {new:true});
      
      const {code,email}=user;
     res.status(200).send({
      status:1,
      message:"OTP successfully generated",
      code,
      email
     })

  }catch(err){
    console.error("Error",err.message.red)
    console.error("msg","Something went wrong")
    return res.status(500).send({
      status:0,
      message:"Something went wrong"
    })
  }
}

//@desc reset password
//@route PUT /api/v1/users/create
//@access Private
const reset_password=()=>{
  try{

  }catch(err){
    console.error("Error",err.message.red)
  }
}

//@desc update a user
//@route PUT /api/v1/users/create
//@access Private
// Do not update email and password
const updateUser = async (req, res) => {
  // const {id}=req.params;
  const { name, email, password, phone } = req.body;
  const { id } = req;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("invalid user id, no such user exists");
    }

    const user = await Users.findById(id);
    if (!user) {
      // res.status(404);
      // throw new Error("User not found");
      return res.status(404).send({
        status: 1,
        message: "user not found",
      });
    }
    if (user?._id.toString() !== id.toString()) {
      res.status(403);
      throw new Error("user is not authorized to update this user");
    }
    if (!name) {
      res.status(404);
      throw new Error("please enter your name");
    }
    if (!email) {
      res.status(404);
      throw new Error("please enter your email");
    }
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      res.status(400);
      throw new Error("not a valid Email");
    }
    if (!password) {
      res.status(404);
      throw new Error("please enter your pasword");
    }
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      res.status(400);
      throw new Error("not a valid password");
    }
    if (!phone) {
      res.status(404);
      throw new Error("please enter your phone number");
    }
    if (!phone.match(/^[0-9]{11}$/)) {
      res.status(400);
      throw new Error("Phone number must have 11 digits");
    }

    // console.log("p: ",password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("h: ",hashedPassword)
    const updateUser = await Users.findByIdAndUpdate(
      { _id: id },
      { ...req.body, password: hashedPassword },
      { new: true }
    );

    return res.status(200).send({
      status: 1,
      message: "user has been updated",
      user: updateUser,
    });
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.send({ Error: err.message });
  }
};

//@desc delete a user
//@route DELETE /api/v1/users/delete
//@access Private
const deleteUser = async (req, res) => {
  // const { id } = req.params;
  const { id } = req;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("invalid user id, no such user exists");
    }

    const user = await Users.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await Users.deleteOne({ _id: id });
    // res.status(200).send({ message: `deleted user sucessfully at ID:${id}`,user:deleteUser });
    return res.status(200).send({
      status: 1,
      message: `deleted user sucessfully at ID:${id}`,
    });
  } catch (err) {
    console.error("Error", `${err}`.red);
    res.send({ Error: err.message });
  }
};

module.exports = {
  addUser,
  otp_verify,
  loginUser,
  Complete_profile,
  forget_password,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
