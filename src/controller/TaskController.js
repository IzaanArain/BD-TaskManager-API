const User = require("../models/UserModel");
const Task = require("../models/TaskModel");
const mongoose = require("mongoose");
const moment=require("moment")

const create_task = async (req, res) => {
  try {
    const adminId = req.id;
    const userId = req.params.id;
    const { title, description, amount, completion_date } = req.body;
    if (!mongoose.isValidObjectId(userId)) {
      console.error("Error", "not valid user".red);
      return res.status(404).send({
        status: 0,
        message: "not valid user",
      });
    } else if (!title) {
      return res.status(404).send({
        status: 0,
        message: "must have title",
      });
    } else if (!description) {
      return res.status(404).send({
        status: 0,
        message: "must have description",
      });
    } else if (!amount) {
      return res.status(404).send({
        status: 0,
        message: "please enter amount",
      });
    } else if (!completion_date) {
      return res.status(404).send({
        status: 0,
        message: "Task must have completion date",
      });
    }
    const com_date = completion_date.split("T")[0];
    if (
      !com_date.match(
        /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/
      )
    ) {
      return res.status(404).send({
        status: 0,
        message: "date must be in YYYY-MM-DD",
      });
    }
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    const taskUser = await User.findOne({ _id: userId, role: "user" });
    if (!admin) {
      return res.status(404).send({
        status: 0,
        message: "you are not Admin",
      });
    } else if (!taskUser) {
      return res.status(404).send({
        status: 0,
        message: "user not found",
      });
    }
    const date1=moment(Date.now())
    const date2=moment(com_date)
    if(date2.isBefore(date1)){
        return res.status(404).send({
            status: 0,
            message: "completion date can not be before assigned date",
          });
    }
    const future_date=date1.add(1,"months")
    if(date2.isAfter(future_date)){
        return res.status(404).send({
            status: 0,
            message: "duratuion of task must be within 1 month",
          });
    }
    const task = await Task.create({
      title,
      description,
      amount,
      completion_date:date2.format('MMMM Do YYYY, h:mm:ss a'),
      status: "assigned",
      freeLancer_id: userId,
      createdBy_id: adminId,
    });

    res.status(200).send({
      status: 1,
      message: "Successfully created task",
      task,
    });
  } catch (err) {
    console.error("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  create_task,
};
