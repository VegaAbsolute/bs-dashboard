var express = require('express');
var router = express.Router();

const getStateRoute = ({logger, getState, Session}) => {
    return router.post('/', (request, response, next) => {
        try {
            const { cmd='', loginToken='' } = request.body;

            const access = Session.checkToken(loginToken, request.headers.origin);

            logger.info(`POST/GET-STATE: cmd = ${cmd}`);
            logger.info(`Access = ${access}`);

            if (access) {
                const getStateHandler = require('../src/pages/get-state/get-state-handler.js').getStateHandler;
                getStateHandler({cmd, loginToken, response, logger, getState});
            } else {
                response.json({ cmd, result: false, msg: 'login_not_performed' });
            }

        } catch (err) {
            logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
            response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
        }
    });
}


module.exports = getStateRoute;
