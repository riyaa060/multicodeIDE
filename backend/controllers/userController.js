const userModel= require

exports.signUp=(req,res)=> {
    try{

    }catch(error)
    {
        res.status(500).json({
            success: false,
            msg: error.message
        })
    }
}