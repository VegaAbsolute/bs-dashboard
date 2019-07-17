const loraGlobalConfigsHandler = ({cmd, filePath, defaultFilePath, data, response, logger}) => {
    switch (cmd) {
        case 'get_global_conf': {
            const readConfig = require('./read-config.js').readConfig;
            const configs = readConfig({filePath});
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
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({filePath, data, logger})) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure' });
            }

            break;
        }

        default: {
            logger.warn(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.loraGlobalConfigsHandler = loraGlobalConfigsHandler;
