var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { Session, logger, SETTINGS, ISSUPPORT3G } = request.appParams;
    try {
        const { filePath, fileName } = SETTINGS.wireless3GConfigs;
        const { cmd='', data={}, loginToken='' } = request.body;

        const access = Session.checkToken(loginToken, request.headers.origin);

        logger.info(`POST/3G-CONFIGS: cmd = ${cmd}`, 0, true);
        logger.info(`Access = ${access}`, 1);

        if (access) {
            logger.info('3g is supported = ' + ISSUPPORT3G, 1);
            if (ISSUPPORT3G) {
                const $3gConfigsHandler = require('../src/unit-for-3g-configs/3g-configs-handler.js').$3gConfigsHandler;
                $3gConfigsHandler({
                    cmd,
                    filePath: filePath + fileName,
                    data,
                    response,
                    logger
                });
            } else {
                logger.warn('3G_is_not_supported');
                response.json({ cmd, result: false, msg: '3G_is_not_supported' });
            }
        } else {
            logger.warn('login_not_performed');
            response.json({ cmd, result: false, msg: 'login_not_performed' });
        }

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
