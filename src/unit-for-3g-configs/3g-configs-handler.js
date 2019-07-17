const $3gConfigsHandler = ({
    cmd,
    filePath,
    data,
    response,
    logger
}) => {
    switch (cmd) {
        case 'get_3g_conf': {
            const readConfig = require('./read-config.js').readConfig;
            const configs = readConfig({filePath, logger});
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
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({filePath, data, logger})) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure' });
            }
            break;
        }

        default: {
            logger.warn('unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.$3gConfigsHandler = $3gConfigsHandler;
