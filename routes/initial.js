var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { logger, SETTINGS, dirName } = request.appParams;

    try {
        const { cmd='', data={} } = request.body;

        logger.info(`POST/INITIAL: cmd = ${cmd}`);

        const initialHandler = require('../src/pages/initial/initial-handler.js').initialHandler;
        initialHandler({cmd, data, SETTINGS, dirName, response, logger});

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
