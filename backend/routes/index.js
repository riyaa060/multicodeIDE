var express = require('express');
var router = express.Router();
const { signUp, logIn, createProj, saveProject, getProjects, getProject, deleteProject, editProject } = require('../controllers/userController');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//signUp in controller function(controllers folder)
router.post("/signUp", signUp)
router.post("/logIn", logIn)
router.post("/createProj", createProj)
router.post("/saveProject", saveProject); 
router.post("/getProjects", getProjects); 
router.post("/getProject", getProject); 
router.post("/deleteProject", deleteProject); 
router.post("/editProject", editProject); 
module.exports = router;
