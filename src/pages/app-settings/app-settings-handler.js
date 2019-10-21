const appSettingsHandler = ({
    cmd,
    data,
    response,
    SETTINGS,
    DASHBOARD_ROOT_DIR,
    logger
}) => {
    logger.debug('appSettingsHandler');
    logger.silly(data);

    switch (cmd) {
        /**
         * Manager settings
         */
        case 'get_manager_settings': {
            logger.silly('handler case: get_manager_settings');
            const readManagerSettings = require('./read-manager-settings.js').readManagerSettings;
            const result = readManagerSettings(DASHBOARD_ROOT_DIR)(logger);
            response.json({ cmd, result: true, data: result });
            break;
        }


        case 'set_manager_settings': {
            logger.silly('handler case: set_manager_settings');
            const writeManagerSettings = require('./write-manager-settings.js').writeManagerSettings;
            const writeResult = writeManagerSettings(DASHBOARD_ROOT_DIR, data)(logger);

            if (writeResult.isValid) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'data_is_not_valid', data: writeResult.msg });
            }
            break;
        }


        /**
         * Dashboard settings
         */
        case 'get_dashboard_settings': {
            logger.silly('handler case: get_dashboard_settings');
            const readDasboardSettings = require('./read-dashboard-settings.js').readDasboardSettings;
            const result = readDasboardSettings(DASHBOARD_ROOT_DIR)(logger);
            response.json({ cmd, result: true, data: result });
            break;
        }


        case 'set_dashboard_settings': {
            logger.silly('handler case: set_dashboard_settings');
            const writeDashboardSettings = require('./write-dashboard-settings.js').writeDashboardSettings;
            const writeResult = writeDashboardSettings(DASHBOARD_ROOT_DIR, data)(logger);

            if (writeResult.isValid) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'data_is_not_valid', data: writeResult.msg });
            }
            break;
        }


        /**
         * Password setttings
         */
        case 'set_password_settings': {
            logger.silly('handler case: set_password_settings');
            const writePasswordSettings = require('./write-password-settings.js').writePasswordSettings;
            const result = writePasswordSettings(DASHBOARD_ROOT_DIR, data)(logger);

            if (result.result) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure', data: result.message });
            }
            break;
        }

        default: {
            logger.silly('handler case: default');
            logger.warn('unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.appSettingsHandler = appSettingsHandler;
