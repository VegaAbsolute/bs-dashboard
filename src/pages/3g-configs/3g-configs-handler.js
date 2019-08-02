const $3gConfigsHandler = ({
    cmd,
    SETTINGS,
    data,
    response,
    logger
}) => {
    logger.debug('$3gConfigsHandler');
    logger.silly(data);
    
    const { fileDir, fileName, interfaceManagerFileDir, interfaceManagerFileName } = SETTINGS.wireless3GConfigs;
    const filePath = fileDir + fileName;
    const interfaceManagerFilePath = interfaceManagerFileDir + interfaceManagerFileName;

    switch (cmd) {
        case 'get_3g_conf': {
            logger.silly('handler case: get_3g_conf');
            const readConfig = require('./read-config.js').readConfig;
            const configs = readConfig({filePath, interfaceManagerFilePath, logger});
            const result = {
                cmd,
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        case 'set_3g_conf': {
            logger.debug('handler case: set_3g_conf');
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({filePath, interfaceManagerFilePath, data, logger})) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure' });
            }
            break;
        }

        default: {
            logger.debug('handler case: default');
            logger.warn('unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.$3gConfigsHandler = $3gConfigsHandler;
