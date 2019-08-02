var express = require('express');
var router = express.Router();

router.post('/', (request, response, next) => {
    const { Session, ISSUPPORT3G, logger, DASHBOARD_ROOT_DIR } = request.appParams;

    try {
        const { cmd='', data={} } = request.body;
        const { origin: requestOrigin } = request.headers;
        const additionalDataResponse = {
            isSupport3G: ISSUPPORT3G
        }

        logger.info(`POST/AUTHORIZATION: cmd = ${cmd}`);

        const authorizationHandler = require('../src/pages/authorization/authorization-handler.js').authorizationHandler;
        authorizationHandler({cmd, DASHBOARD_ROOT_DIR, data, requestOrigin, Session, response, additionalDataResponse, logger});

    } catch (err) {
        logger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + err.name + '] -' + err.message});
    }
});

module.exports = router;
