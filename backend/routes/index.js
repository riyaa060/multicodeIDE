var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//signUp in controller function(controllers folder)
router.post("/signUp", signUp)

module.exports = router;
