const authorizationHandler = ({
    cmd,
    data,
    requestOrigin,
    Session,
    response,
    DASHBOARD_ROOT_DIR,
    additionalDataResponse,
    logger
}) => {
    logger.debug('authorizationHandler');
    switch (cmd) {
        case 'login_request': {
            logger.silly('handler case: login_request');
            const userAuthentication = require('./user-authentication.js').userAuthentication;
            const userAuthenticationResult = userAuthentication({Session, data, requestOrigin, logger, DASHBOARD_ROOT_DIR});
            let result;

            if (userAuthenticationResult.result === true) {
                result = Object.assign({}, userAuthenticationResult, additionalDataResponse)
            } else {
                result = Object.assign({}, userAuthenticationResult)
            }

            response.json(result);
            break;
        }
        case 'logout_request': {
            logger.silly('handler case: logout_request');
            Session.closeSession(JSON.parse(data));
            response.json({ cmd, result: true, msg: 'success' });
            break;
        }
        default: {
            logger.silly('handler case: default');
            logger.warn('unknown_command')
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.authorizationHandler = authorizationHandler;
