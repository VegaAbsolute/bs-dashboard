var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { Session, logger, SETTINGS } = request.appParams;

    try {
        const { filePath, fileName, defaultFilePath } = SETTINGS.loraGlobalConfigs;
        const { cmd='', data={}, loginToken='' } = request.body;

        const access = Session.checkToken(loginToken, request.headers.origin);

        logger.info(`POST/GLOBAL-CONFIGS: cmd = ${cmd}`);
        logger.info(`Access = ${access}`);

        if (access) {
            const loraGlobalConfigsHandler = require('../src/unit-for-lora-global-configs/lora-global-configs-handler.js').loraGlobalConfigsHandler;
            loraGlobalConfigsHandler({cmd, filePath: filePath + fileName, defaultFilePath, data, response, logger});
        } else {
            logger.info('login_not_performed');
            response.json({ cmd, result: false, msg: 'login_not_performed' });
        }

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
