const loraLogsHandler = ({cmd, loginToken, LoraLogger, response, logger}) => {
    logger.debug('loraLogsHandler');

    switch (cmd) {
        case 'get_lora_log': {
            logger.silly('handler case: get_lora_log');


            const result = {
                cmd: 'get_lora_log',
                result: true,
                msg: 'success',
                data: LoraLogger.getLog(loginToken)
            }
            response.json(result);
            break;
        }

        default: {
            logger.silly('handler case: default');
            logger.warn(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.loraLogsHandler = loraLogsHandler;
