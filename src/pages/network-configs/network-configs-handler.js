const networkConfigsHandler = ({cmd, SETTINGS, data, response, logger}) => {
    logger.debug('networkConfigsHandler');
    logger.silly(data);

    switch (cmd) {

        case 'get_network_conf': {
            logger.silly('handler case: get_network_conf');
            const readConfig = require('./read-config.js').readConfig;
            const configs = readConfig({SETTINGS, logger});
            const result = {
                cmd: 'get_network_conf',
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        case 'set_network_conf': {
            logger.silly('handler case: set_network_conf');
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({SETTINGS, data, logger})) {
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

exports.networkConfigsHandler = networkConfigsHandler;
