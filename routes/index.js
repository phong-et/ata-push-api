var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (_, res, _) {
  res.sendFile('index2.html');
});

module.exports = router;
