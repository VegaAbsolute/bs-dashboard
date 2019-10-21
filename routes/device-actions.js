var express = require('express');
var router = express.Router();

const deviceActions = ({logger, Session, getState}) => {
    return router.post('/', (request, response, next) => {
        const {
            SETTINGS,
            DASHBOARD_ROOT_DIR,
            SERVER_PACKAGE,
            lastVersionData,
            managerVersion
        } = request.appParams;

        try {
            const { cmd='', data={}, loginToken='' } = request.body;
            const access = Session.checkToken(loginToken, request.headers.origin);

            logger.info(`POST/DEVICE-ACTIONS: cmd = ${cmd}`, 0, true);
            logger.info(`Access = ${access}`, 1);

            if (access) {
                const deviceActionsHandler = require('../src/pages/device-actions/device-actions-handler.js').deviceActionsHandler;
                deviceActionsHandler({
                    cmd,
                    data,
                    response,
                    SETTINGS,
                    DASHBOARD_ROOT_DIR,
                    logger,
                    getState
                });
            } else {
                response.json({ cmd, result: false, msg: 'login_not_performed' });
            }

        } catch (err) {
            logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
            response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
        }
    });
}


module.exports = deviceActions;
