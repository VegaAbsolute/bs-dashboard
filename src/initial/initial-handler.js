const initialHandler = ({
    cmd,
    data,
    SETTINGS,
    dirName,
    response,
    logger
}) => {
    switch (cmd) {
        case 'fetch_language': {
            const { language } = SETTINGS.serverConfigs;
            response.json({ cmd, result: true, data: language });
            break;
        }

        case 'set_language': {
            const setLanguage = require('./set-language.js').setLanguage
            setLanguage({SETTINGS, response, cmd, logger, data, filePath: dirName + '/settings.json'})
            break;
        }

        default: {
            logger.error(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.initialHandler = initialHandler;
