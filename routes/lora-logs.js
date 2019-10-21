var express = require('express');
var router = express.Router();

const loraLogs = ({logger, LoraLogger, Session}) => {
    return router.post('/', (request, response, next) => {
        try {
            const { cmd='', loginToken='' } = request.body;

            const access = Session.checkToken(loginToken, request.headers.origin);

            logger.info(`POST/LORA-LOGGER: cmd = ${cmd}`);
            logger.info(`Access = ${access}`);

            if (access) {
                const loraLogsHandler = require('../src/pages/lora-logs/lora-logs-handler.js').loraLogsHandler;
                loraLogsHandler({cmd, loginToken, LoraLogger, response, logger});
            } else {
                response.json({ cmd, result: false, msg: 'login_not_performed' });
            }

        } catch (err) {
            logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
            response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
        }
    });
}


module.exports = loraLogs;
