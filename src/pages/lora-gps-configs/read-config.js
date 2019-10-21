const read = require('../../utils/lora-config-files-actions/read-config.js').readConfig;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;



const readConfig = ({SETTINGS, logger}) => {
    logger.silly('readConfig');

    const dataMask = {
        gateway_conf:{
            ref_latitude: 0,
            ref_longitude: 0,
            ref_altitude: 0,
            fake_gps: false
        }
    };

    const fullConfigs = read({SETTINGS, logger});
    let sendConfigs = parseObjectByMask(fullConfigs, dataMask, true).gateway_conf;

    sendConfigs.use_gps = (fullConfigs.gateway_conf.gps_tty_path === '/dev/ttyO1') ? 'enabled' : 'disabled';

    logger.silly(sendConfigs);
    return sendConfigs;
}

exports.readConfig = readConfig;
