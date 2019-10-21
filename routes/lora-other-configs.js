var express = require('express');
var router = express.Router();

const loraOtherConfigs = ({ logger, Session, SETTINGS }) => {

    return router.post('/', (request, response, next) => {
        try {
            const { cmd='', loginToken='', data={} } = request.body;
            const { filePath, fileName } = SETTINGS.loraGlobalConfigs;

            const access = Session.checkToken(loginToken, request.headers.origin);

            logger.info(`POST/LORA-OTHER-CONFIGS: cmd = ${cmd}`);
            logger.info(`Access = ${access}`);

            if (access) {
                const handler = require('../src/pages/lora-other-configs/handler.js').handler;
                handler({cmd, data, response, logger, SETTINGS});
            } else {
                response.json({ cmd, result: false, msg: 'login_not_performed' });
            }

        } catch (err) {
            logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
            response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
        }
    });
}


module.exports = loraOtherConfigs;
