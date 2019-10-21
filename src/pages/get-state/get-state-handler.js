const getStateHandler = ({cmd, loginToken, response, logger, getState}) => {
    logger.debug('getStateHandler');

    switch (cmd) {
        case 'get_update_state': {
            logger.silly('handler case: get_update_state');

            const { update } = getState();
            const result = {
                cmd: 'get_update_state',
                result: true,
                msg: 'success',
                data: update
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

exports.getStateHandler = getStateHandler;
