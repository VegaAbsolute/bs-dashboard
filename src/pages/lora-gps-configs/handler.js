const handler = ({cmd, data, response, logger, SETTINGS}) => {
    logger.debug('loraGpsConfigsHandler');
    logger.silly(data);

    switch (cmd) {
        case 'get_lora_gps_conf': {
            logger.silly('handler case: get_lora_gps_conf');
            const readConfig = require('./read-config.js').readConfig;

            const configs = readConfig({ SETTINGS, logger });
            const result = {
                cmd,
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        case 'set_lora_gps_conf': {
            logger.silly('handler case: set_lora_gps_conf');
            const writeConfig = require('./write-config.js').writeConfig;
            const writeResult = writeConfig({SETTINGS, data, logger});

            if (writeResult.isValid) {

                // Reboot LoRa
                if (SETTINGS.serverConfigs.isRebootLoraOnSaveConfigs) {
                    const exec = require('child_process').exec;
                    exec('killall lora_pkt_fwd', () => {
                        logger.info('Reboot LoRa.');
                    });
                }

                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'data_is_not_valid', data: writeResult.msg });
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

exports.handler = handler;
