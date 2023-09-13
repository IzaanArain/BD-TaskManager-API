



const create_task=(req,res)=>{
    res.status(200).send({message:"Task created"})
};


module.exports={
    create_task
}