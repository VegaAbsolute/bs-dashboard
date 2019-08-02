const aboutHandler = ({
    cmd,
    data,
    response,
    version,
    SETTINGS,
    DASHBOARD_ROOT_DIR,
    managerVersion,
    lastVersionData,
    logger
}) => {
    logger.debug('aboutHandler');
    logger.silly(data);
    switch (cmd) {
        case 'fetch_about_info': {
            logger.silly('handler case: fetch_about_info');
            const fetchInfo = require('./fetch-info.js').fetchInfo;
            const result = fetchInfo({version, managerVersion, lastVersionData, SETTINGS, logger});
            response.json({ cmd, result: true, data: result });
            break;
        }

        default: {
            logger.silly('handler case: default');
            logger.error(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.aboutHandler = aboutHandler;
