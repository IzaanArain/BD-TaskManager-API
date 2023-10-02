const Users = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//Create Token function
const createToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.SECRET_TOKEN);
};

//@desc get all user
//@route GET /api/v1/users/
const getAllUsers = async (req, res) => {
 const adminId=req.id
  try {
    const userCheck = await Users.findOne({_id:adminId,role:"admin"});
    if (!userCheck) {
      return res.status(404).send({
        status:0,
        message:"you are not Admin"
      })
    }
    const user = await Users.find({}).sort({ createdAt: -1 });
    // res.status(200).send(user);
    const userMap = user.map(
      ({ name, email, phone, createdAt, updatedAt,image }) => ({
        name,
        email,
        phone,
        image,
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
const getUser = async (req, res) => {
  // const { id } = req.params;
  const id = req.id;
  try {
    const user = await Users.findOne({_id:id});

    if (!user) {
      return res.status(404).send({
        status:0,
        message:"User not found"
      })
    }
    return res.status(200).send({
      status: 1,
      message: "user successfully fetched",
      user,
    });
  } catch (err) {
    res.status(500).send({
      status:0, 
      message:"something went wrong" 
    });
  }
};

//@desc add a user
//@route POST /api/v1/users/create
const addUser = async (req, res) => {
  try {
    const {
      email: typed_email,
      password: typed_password,
      role: set_role,
    } = req.body;

    const allRoles = ["admin", "user"];
    if (!typed_email) {
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
    } else if (!set_role) {
      return res.status(404).send({
        status: 0,
        message: "must have a role",
      });
    }

    const rol = set_role.toLowerCase();
    if (!allRoles.includes(rol)) {
      return res.status(404).send({
        status: 0,
        message: "Invalid role",
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
      role: rol,
      code: otp_code,
    });

    const { code, email, role } = user;
    return res.status(200).send({
      status: 1,
      message: "user OTP created successfully",
      data: { code, email, role },
    });
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "User OTP not generated",
      Error:err.message
    });
  }
};

//@desc OTP verification
//@route POST /api/v1/users/otp_verify
const otp_verify = async (req, res) => {
  try {
    const { code: otp_code, email: typed_email } = req.body;
    if (!typed_email) {
      return res.status(404).send({
        status: 0,
        message: "please enter your email",
      });
    } else if (!typed_email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        status: 0,
        message: "Please enter a valid email",
      });
    } else if (!otp_code) {
      return res.status(404).send({
        status: 0,
        message: "please enter OTP code",
      });
    } else if (otp_code.length!==6) {
      return res.status(404).send({
        status: 0,
        message: "OTP code must have six digits",
      });
    }

    const user = await Users.findOne({ email: typed_email });
    if (!user) {
      return res.status(404).send({
        status: 0,
        message: "user does not exist",
      });
    }
    const userCode = user.code;
    const userEmail = user.email;

    if (userCode === parseInt(otp_code)) {
      const userVerified = await Users.findOneAndUpdate(
        { email: userEmail },
        { isVerified: true },
        { new: true }
      );
      const { email, code, isVerified } = userVerified;
      return res.status(200).send({
        status: 1,
        message: "user OTP successfully verified",
        data: { code, email, isVerified },
      });
    } else {
      return res.status(404).send({
        status: 0,
        message: "OTP code does not match",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Not a valid OTP code",
    });
  }
};

//@desc complete profile
//@route POST /api/v1/users/complete_profile
const Complete_profile = async (req, res) => {
  try {
    const userId=req.id;
    const { name, phone, email} = req.body;
    const allowed_image_types = ["image/png", "image/jpeg", "image/gif"];
    if (!name) {
      return res.status(400).send({
        status: 0,
        message: "Must have a user Name",
      });
    } else if (name.length > 50) {
      return res.status(400).send({
        status: 0,
        message: "Name can not be more th 50 character",
      });
    } else if (!phone) {
      return res.status(400).send({
        status: 0,
        message: "must have phone a number",
      });
    } else if (
      !phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    ) {
      return res.status(400).send({
        status: 0,
        message: "Phone number must have 11 digits",
      });
    } else if (!email) {
      return res.status(404).send({
        status: 0,
        message: "please enter your email",
      });
    } else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        status: 0,
        message: "Please enter a valid email",
      });
    } else if (!req?.file) {
      return res.status(404).send({
        status: 0,
        message: "Please upload an image",
      });
    } else if (!allowed_image_types.includes(req?.file?.mimetype)) {
      return res.status(404).send({
        status: 0,
        message: "you can only upload .jpg .png .gif types",
      });
    }

    const user=await Users.findOne({_id:userId})
    if (!user){
      return res.status(404).send({
        status: 0,
        message: "user not found",
      });
    }
    const userVerified = await Users.findOne({ email, isVerified: true });
    if(userVerified?._id.toString()!==userId.toString()){
      return res.status(404).send({
        status: 0,
        message: "you must be verified to access this profile",
      });
    }else if (userVerified) {
      const image_path = req?.file?.path?.replace(/\\/g, "/");
      const user = await Users.findOneAndUpdate(
        { email },
        { name, phone, image: image_path, isComplete: true},
        { new: true }
      );
      res.status(200).send({
        status: 1,
        message: "Profile Completed Successfully",
        user,
      });
    } else {
      return res.status(400).send({
        status: 0,
        message: "Not verified",
        isComplete,
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Profile Not complete",
      isComplete: true,
    });
  }
};

//@desc login a user
//@route POST /api/v1/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(404).send({
        message: "please enter email",
        status: 0,
      });
    } else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        message: "not a valid Email",
        status: 0,
      });
    } else if (!password) {
      return res.status(404).send({
        message: "please enter password",
        status: 0,
      });
    } else if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      return res.status(400).send({
        message:
          "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
        status: 0,
      });
    }

    const user = await Users.findOne({email});

    if (!user) {
      return res.status(400).send({
        message: "user does not exist",
        status: 0,
      });
    }
    const userVerified=user.isVerified;
    if(!userVerified){
      return res.status(400).send({
        message: "user is not verified",
        status: 0,
      });
    }
    const isBlocked=user.isBlocked
    if(isBlocked){
      return res.status(400).send({
        message: "you are blocked please contact admin for further details",
        status: 0,
      });
    }
    const deleted=user.isDelete
    if(deleted){
      return res.status(400).send({
        message: "you are deleted please contact admin for further details",
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
    ); //.select("-password"); // removes password or any other key

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
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      Error: err.message,
    });
  }
};

//@desc forgot password
//@route POST /api/v1/users/forget_password
const forget_password = async (req, res) => {
  try {
    const { email: typed_email } = req.body;
    if (!typed_email) {
      return res.status(404).send({
        status: 1,
        message: "please enter email",
      });
    } else if (!typed_email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        message: "not a valid Email",
        status: 0,
      });
    }

    const userExists = await Users.findOne({ email: typed_email });
    if (!userExists) {
      return res.status(404).send({
        message: "user does not exist",
        status: 0,
      });
    }

    // OTP code
    const otp_code = Math.floor(Math.random() * 900000) + 100000;

    const user = await Users.findOneAndUpdate(
      { email: typed_email },
      { code: otp_code, isForgetPassword: true,isVerified:false},
      { new: true }
    );

    const { code, email, isForgetPassword, isVerified } = user;
    res.status(200).send({
      status: 1,
      message: "OTP successfully generated",
      code,
      email,
      isForgetPassword,
      isVerified,
    });
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

//@desc reset password
//@route PUT /api/v1/users/reset_password
const reset_password = async (req, res) => {
  try {
    const { email: typed_email, password: new_password } = req.body;

    if (!typed_email) {
      return res.status(404).send({
        status: 1,
        message: "please enter email",
      });
    } else if (!typed_email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return res.status(404).send({
        message: "not a valid Email",
        status: 0,
      });
    } else if (!new_password) {
      return res.status(404).send({
        message: "please enter password",
        status: 0,
      });
    } else if (
      !new_password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      return res.status(400).send({
        message:
          "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
        status: 0,
      });
    }

    const user_verified = await Users.findOne({
      email: typed_email,
      isForgetPassword: true,
      isVerified:true
    });
    if (!user_verified) {
      return res.status(404).send({
        message: "user not verified",
        status: 0,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    const user_update = await Users.findOneAndUpdate(
      { email: typed_email },
      {
        password: hashedPassword,
        isForgetPassword: false,
      },
      { new: true }
    );
    const user_email = user_update.email;
    res.status(200).send({
      status: 1,
      message: "password successfully reset",
      email: user_email,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      message: "password failed reset",
    });
  }
};

//@desc enable notification
//@route PUT /api/v1/users/notification
const notification = async (req, res) => {
  try {
    const id = req.id;
    const { device_token, device, social_token, social_type } = req.body;
    const user=await Users.findOne({_id:id})
    const notif=user.is_notification;

      const userUpdate = await Users.findOneAndUpdate(
        { _id: id },
        {
          is_notification:!notif,
          device_token,
          device,
          social_token,
          social_type,
        },
        { new: true }
      );
      const { is_notification,email } = userUpdate;
     if(is_notification){
      res.status(200).send({
        status: 1,
        Message: `Notification is enabled for ${email}`,
        is_notification,
      });
     }else{
      res.status(200).send({
        status: 1,
        Message: `Notification is disabled for ${email}`,
        is_notification,
      });
     }
   
  } catch (err) {
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

//@desc block user
//@route PUT /api/v1/users/block_user
const block_user = async (req, res) => {
  try {
    const user_id = req.params.id;
    const adminId = req.id;

    const adminUser = await Users.findOne({ _id: adminId, role: "admin" });
    if (!adminUser) {
      return res.status(404).send({
        message: "you are not Admin",
        status: 0,
      });
    } else if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(404).send({
        status: 0,
        message: "invalid user id",
      });
    }

    const blockUser = await Users.findOne({_id:user_id,role:"user"});
    if (!blockUser) {
      return res.status(404).send({
        status: 1,
        message: "user not found",
      });
    } 
    const block=blockUser.isBlocked;
    const user = await Users.findOneAndUpdate(
      { _id: user_id },
      { isBlocked: !block },
      { new: true }
    );
    const { email: user_email, isBlocked } = user;

   if(isBlocked){
    return res.status(200).send({
      status: 1,
      message: `${user_email} has been blocked`,
      isBlocked,
    });
   }else{
    return res.status(200).send({
      status: 1,
      message: `${user_email} has been unblocked`,
      isBlocked,
    });
   }
  } catch (err) {
    return res.status(500).send({
      message: "something went wrong",
      status: 0,
    });
  }
};

//@desc change password
//@route PUT /api/v1/users/change_password
const change_password = async (req, res) => {
  try {
    const id = req.id;
    const { password: new_password } = req.body;
    if (!new_password) {
      return res.status(404).send({
        message: "please enter password",
        status: 0,
      });
    } else if (
      !new_password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      return res.status(400).send({
        message: "not a valid password",
        status: 0,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    const user = await Users.findOneAndUpdate(
      { _id: id },
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).send({
      status: 1,
      message: "password changed successfully",
      user,
    });
  } catch (err) {
    return res.status(500).send({
      message: "something went wrong",
      status: 0,
    });
  }
};

//@desc update a user
//@route PUT /api/v1/users/create
// Do not update email and password
const updateUser = async (req, res) => {
  try {
    const { name, phone } = req?.body;
    const allowed_image_types = ["image/png", "image/jpeg", "image/gif"];
    const id = req.id;
    if (!name) {
      return res.status(404).send({
        message: "please enter your name",
      });
    } else if (name.length > 50) {
      return res.status(404).send({
        message: "name can not be more than 50 characters",
      });
    } else if (!phone) {
      return res.status(404).send({
        message: "please enter your phone number",
      });
    } else if (
      !phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    ) {
      return res.status(404).send({
        message: "Phone number must have 11 digits",
      });
    } else {
      const image_path = req?.file?.path?.replace(/\\/g, "/");
      const updateUser = await Users.findByIdAndUpdate(
        { _id: id },
        { name, phone, image: image_path },
        { new: true }
      );

      return res.status(200).send({
        status: 1,
        message: "user has been updated",
        user: updateUser,
      });
    }
  } catch (err) {
    console.error("Error", `${err.message}`.red);
    res.send({ Error: err.message });
  }
};

//@desc delete a user 
//@route DELETE /api/v1/users/user_delete
const user_delete=async(req,res)=>{
  const userId=req.id
    const deleteUser=await Users.findOneAndUpdate(
      {_id:userId},
      {isDelete:true},
      {new:true});
  
      const {email,isDelete}=deleteUser;
        res.status(200).send({
          status:0,
          message: `deleted user sucessfully ${email}`,
          isDelete,
        })
}
//@desc delete a user by admin
//@route DELETE /api/v1/users/admin_delete
const adminDeleteUser = async (req, res) => {
  try {
    const adminId = req.id;
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).send({
        status: 0,
        message: "invalid user id, no such user exists",
      });
    }
    const userDelete = await Users.findOne({_id:userId,role:"user"});
    if (!userDelete) {
      return res.status(404).send({
        status: 1,
        message: "user not found",
      });
    } 

    const adminUser = await Users.findOne({ _id: adminId, role: "admin" });
    if (adminUser) {
      const del=userDelete.isDelete
      const userUpdated = await Users.findOneAndUpdate(
        { _id: userId,role:"user" },
        { isDelete: !del },
        { new: true }
      );

      const { email, isDelete } = userUpdated;
      if (isDelete){
        return res.status(200).send({
          status: 1,
          message: `deleted user sucessfully ${email}`,
          isDelete,
        });
      }else{
        return res.status(200).send({
          status: 1,
          message: `user sucessfully restored ${email}`,
          isDelete,
        });
      }

    } else {
      return res.status(400).send({
        message: "you are not admin",
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: "something went wrong",
      status: 0,
    });
  }
};

module.exports = {
  addUser,
  otp_verify,
  loginUser,
  Complete_profile,
  forget_password,
  reset_password,
  notification,
  block_user,
  change_password,
  getAllUsers,
  getUser,
  updateUser,
  adminDeleteUser,
  user_delete
};
