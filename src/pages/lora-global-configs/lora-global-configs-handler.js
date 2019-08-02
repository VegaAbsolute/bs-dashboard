const loraGlobalConfigsHandler = ({cmd, filePath, defaultFilePath, data, response, logger}) => {
    logger.debug('loraGlobalConfigsHandler');
    logger.silly(data);

    switch (cmd) {
        case 'get_global_conf': {
            logger.silly('handler case: get_global_conf');
            const readConfig = require('./read-config.js').readConfig;
            const configs = readConfig({filePath, logger});
            const result = {
                cmd: 'get_global_conf',
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        case 'set_global_conf': {
            logger.silly('handler case: set_global_conf');
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({filePath, data, logger})) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure' });
            }

            break;
        }

        default: {
            logger.silly('handler case: default');
            logger.warn(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.loraGlobalConfigsHandler = loraGlobalConfigsHandler;
