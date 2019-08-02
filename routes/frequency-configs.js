var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { Session, logger, SETTINGS, dirName } = request.appParams;

    try {
        const { filePath, fileName, defaultFilePath } = SETTINGS.loraGlobalConfigs;
        const { cmd='', data={}, loginToken='' } = request.body;

        const access = Session.checkToken(loginToken, request.headers.origin);

        logger.info(`POST/FREQUENCY-CONFIGS: cmd = ${cmd}`);
        logger.info(`Access = ${access}`);

        if (access) {
            const loraFrequencyConfigsHandler = require('../src/pages/lora-frequency-configs/lora-frequency-configs-handler.js').loraFrequencyConfigsHandler;
            loraFrequencyConfigsHandler({cmd, filePath: filePath + fileName, defaultFilePath, data, response, dirName, logger});
        } else {
            response.json({ cmd, result: false, msg: 'login_not_performed' });
        }

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
