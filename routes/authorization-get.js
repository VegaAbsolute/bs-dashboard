var express = require('express');
var router = express.Router();

router.get('/', (request, response, next) => {
    console.log('----------------------new request----------------------');
    console.log(`GET/AUTHORIZATION`, 0, true);
    response.json({ cmd:'', result: true, msg: 'send login & pass'});
});

module.exports = router;
