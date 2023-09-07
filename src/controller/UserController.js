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
      ({name, email, phone, createdAt, updatedAt }) => ({
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
  const {id}=req;
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
  const { email, password} = req.body;
  console.log(email,password)
  try {
     if (!email) {
      console.error("Error:","please enter your email".red)
      return res.status(404).send({
        status:0,
        message:"please enter your email"
      })
    }else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        status:0,
        message:"Please enter a valid email"
      })
    }else if (!password) {
      return res.status(404).send({
        status:0,
        message:"please enter your pasword"
      })
    }else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) 
      {
      return res.status(404).send({
        status:0,
        message: "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character."
      })
    }
    //check if user exists
    const userExists = await Users.findOne({ email });
    if (userExists) {
      return res.status(404).send({
        status:0,
        message:"user email is already registered, use another email"
      })
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //user is created in db
    const user = await Users.create({ 
      email,
      password: hashedPassword,
    });

    return res.status(200).send({
      status: 1,
      message: "user created successfully",
      user,
    });
  } catch (err) {
    console.error("User not created")
    console.log("Error:",err.message)
    return res.status(500).send({
      status: 0,
      message: "User not created"
    });
  }
};

//@desc add a user
//@route POST /api/v1/users/create
//@access public
const otp_verify = async (req, res) => {
  try {
    
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "User not created"
    });
  }
};

//@desc add a user
//@route POST /api/v1/users/create
//@access public
const Complete_profile = async (req, res) => {
  try {
    
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "User not created"
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
      console.error("Error","please enter email".red);
      return res.status(404).send({
        message:"please enter email",
        status:0
      })
    }
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      console.error("Error","not a valid Email".red);
      return res.status(404).send({
        message:"not a valid Email",
        status:0
      })
    }
    if (!password) {
      console.error("Error","please enter password".red);
      return res.status(404).send({
        message:"please enter password",
        status:0
      })
    }
    if (
      !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      console.error("Error","not a valid password".red);
      return res.status(400).send({
        message:"not a valid password",
        status:0
      })
    }
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send({
        message:"user does not exist",
        status:0
      })
    }

    //compare password with hashed password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).send({
        message:"Incorrect password",
        status:0
      })
    }
    //create token
    const token = createToken(user?._id);

    //save token by updating userAuth in user
    const save_token = await Users.findByIdAndUpdate(
      { _id: user?._id?.toString() },
      { userAuth: token },
      { new: true }
    );

    if (user) {
      const { password, ...others } = save_token._doc
      res.status(200).send({
        message: "login successful",
        status: 1,
        user: others
      });
    } else {
      res.send({
        message: "Login failed",
        status:0,
      });
    }
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.status(500).send({ 
      status:0,
      message:"Something went wrong",
      Error: err.message });
  }
};

//@desc update a user
//@route PUT /api/v1/users/create
//@access Private
// Do not update email and password 
const updateUser = async (req, res) => {
  // const {id}=req.params;
  const {name,email,password,phone}=req.body
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
        status:1,
        message:'user not found',
      })
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
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(password,salt)
    // console.log("h: ",hashedPassword)    
    const updateUser = await Users.findByIdAndUpdate(
      { _id: id },
      { ...req.body,password:hashedPassword },
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
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
