var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const {
        Session,
        logger,
        SETTINGS,
        DASHBOARD_ROOT_DIR, 
        SERVER_PACKAGE,
        lastVersionData,
        managerVersion
    } = request.appParams;

    try {
        const { cmd='', data={}, loginToken='' } = request.body;
        const access = Session.checkToken(loginToken, request.headers.origin);

        logger.info(`POST/ABOUT: cmd = ${cmd}`, 0, true);
        logger.info(`Access = ${access}`, 1);

        if (access) {
            const deviceHandler = require('../src/unit-for-device/device-handler.js').deviceHandler;
            deviceHandler({
                cmd,
                data,
                response,
                SETTINGS,
                DASHBOARD_ROOT_DIR,
                version: SERVER_PACKAGE.version,
                managerVersion,
                lastVersionData,
                logger
            });
        } else {
            response.json({ cmd, result: false, msg: 'login_not_performed' });
        }

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
