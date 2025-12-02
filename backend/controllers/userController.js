const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
var jwt= require('jsonwebtoken');


const secret="secret";
const bcrypt = require('bcryptjs');

function generateStartupCode(language) {
    language = language.toLowerCase();  // Convert input to lowercase to handle case-insensitivity
  
    if (language === "python") {
      return 'print("Hello, World!")';
    } else if (language === "java") {
      return `public class Main {
    public static void main(String[] args) {
      System.out.println("Hello, World!");
    }
  }`;
    } else if (language === "javascript") {
      return 'console.log("Hello, World!");';
    } else if (language === "cpp") {
      return `#include <iostream>
  using namespace std;
  
  int main() {
    cout << "Hello, World!" << endl;
    return 0;
  }`;
    } else if (language === "c") {
      return `#include <stdio.h>
  
  int main() {
    printf("Hello, World!\\n");
    return 0;
  }`;
    } else if (language === "go") {
      return `package main
  
  import "fmt"
  
  func main() {
    fmt.Println("Hello, World!")
  }`;
    } else if (language === "bash") {
      return `#!/bin/bash
  echo "Hello, World!"`;
    } else {
      return 'Language not supported';
    }
  }
  

//SignUp API--------------------------------
exports.signUp = async (req, res) => {
    try {
        let { email, pwd, fullName } = req.body;

        let emailCon = await userModel.findOne({ email: email });
        if (emailCon) {
            return res.status(400).json({
                success: false,
                msg: "Email already exists"
            });
        }

        // Refactored bcrypt logic using async/await
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(pwd, salt);

        let user = await userModel.create({
            email: email,
            password: hash,
            fullName: fullName // Corrected variable case here
        });

        return res.status(200).json({
            success: true,
            msg: "User created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

//logIn API--------------------------------------------------
exports.logIn = async(req,res)=>{
   try{
    let={email,pwd,} =req.body;
    let user= await userModel.findOne({email:email});
    if(!user)
    {
        return res.status(404).json({
            success: false,
            msg: "User not found"
        });
    }

    bcrypt.compare(pwd,user.password, function(err, result){
        if(result){

            let token= jwt.sign({userId:user._id}, secret)

            return res.status(200).json({
                success: true,
                msg: "User logged in successfully",
                token
            });
        }
        else{
            return res.status(401).json({
                success:false,
                msg:"Invalid password"
            });
        }
    })
   }catch (error) {
    res.status(500).json({
        success: false,
        msg: error.message,
    });
}
}

//createProject--------------------------------
exports.createProj= async(req,res)=>{
try{
    // let {name, projLanguage, createdBy}= req.body;
    
 //replace createdBy by token
 let {name, projLanguage, token}= req.body;
 if (!projLanguage) {
  return res.status(400).json({ success: false, msg: "Project language is required" });
}


 //token is generated in logIn API
 let decoded= jwt.verify(token,secret);
 let user= await userModel.findOne({_id: decoded.userId});
if(!user)
{
    return res.status(404).json({
        success: false,
        msg: "User not found"
    });
}


let project= await projectModel.create({
    name: name,
    projLanguage: projLanguage,
    createdBy: user._id,
    code: generateStartupCode(projLanguage)
});

return res.status(200).json({
    success: true,
    msg: "Project created successfully",
    projectId: project._id
})


}catch(error){
    return res.status(500).json({
        success:false,
        msg: error.message
    })
}
}

//saveProject-------------------------------------
exports.saveProject = async (req, res) => {
  try {

    let { token, projectId, code } = req.body;
    console.log("DATA: ",token, projectId, code)
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOneAndUpdate({ _id: projectId }, {code: code});

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully"
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

//getProjects---------------------------------------
exports.getProjects = async (req, res) => {
  try {

    let { token } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let projects = await projectModel.find({ createdBy: user._id });

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects: projects
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

//getProject-----------------------------
exports.getProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOne({ _id: projectId });

    if (project) {
      return res.status(200).json({
        success: true,
        msg: "Project fetched successfully",
        project: project
      });
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

//deleteProject-----------------------------
exports.deleteProject = async (req, res) => {
  try {
    // Step 1: Destructure the token and projectId from the request body
    let { token, projectId } = req.body;

    // Step 2: Decode the token to get the user ID (using the jwt.verify method)
    let decoded = jwt.verify(token, secret);

    // Step 3: Find the user by their ID (decoded.userId) from the userModel
    let user = await userModel.findOne({ _id: decoded.userId });

    // Step 4: If no user is found, return an error response
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Step 5: Find and delete the project by projectId from the projectModel
    let project = await projectModel.findOneAndDelete({ _id: projectId });

    // Step 6: If the project is deleted successfully, send a success response
    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })

  } catch (error) {
    // Step 7: Handle any errors that occur during the process
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};


//editProject----------------------------------
exports.editProject = async (req, res) => {
  try {

    let {token, projectId, name} = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if(project){
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully"
      })
    }
    else{
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};


// bcrypt.genSalt(12, function(err,salt){
        //     bcrypt.hash(pwd, salt, async function (err,hash){
        //         //Stored hash in your password
        //         let user = await userModel.create({
        //             email:email,
        //             password: hash,
        //             fullName: fullName
        //         });
        //         return res.status(200).json({
        //             success: true,
        //             msg: "User created successfully",
        //         });
        //     });
        // });



  