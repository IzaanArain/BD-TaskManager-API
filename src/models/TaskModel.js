const mongoose=require("mongoose")
const moment=require("moment")

const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"title is mandatory"]
    },
    description:{
        type:String,
        required:[true,"must have description"]
    },
    amount:{
        type:Number,
        default:0,
        required:[true,"must have amount"]
    },
    image:{
        type:String,
        default:""
    },
    create_date:{
        type:String,
        default:""
    },
    assign_date:{
        type:String,
        default:"",
    },
    accepted_date:{
        type:String,
        default:"",
    },
    completion_date:{
        type:String,
        default:""
    },
    freeLancer_completion:{
        type:String,
        default:""
    },
    freeLancer_id:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
    },
    status:{
        type:String,
        enum:["todo","assigned", 'completionApproval',"completedByFreelancer"],
        default:"todo",
    },
    createdBy_id:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
    },
},{
    timestamps:true
});

module.exports=mongoose.model("task",TaskSchema);



