var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { Session, logger, SETTINGS } = request.appParams;

    try {
        const { filePath, fileName } = SETTINGS.networkConfigs;
        const { cmd='', data={}, loginToken='' } = request.body;

        const access = Session.checkToken(loginToken, request.headers.origin);

        logger.info(`POST/NETWORK-CONFIGS: cmd = ${cmd}`);
        logger.info(`Access = ${access}`);

        if (access) {
            const networkConfigsHandler = require('../src/unit-for-network-configs/network-configs-handler.js').networkConfigsHandler;
            networkConfigsHandler({cmd, filePath: filePath + fileName, data, response, logger});
        } else {
            response.json({ cmd, result: false, msg: 'login_not_performed' });
        }

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
