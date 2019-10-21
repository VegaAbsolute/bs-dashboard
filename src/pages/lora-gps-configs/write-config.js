const write = require('../../utils/lora-config-files-actions/write-config.js').writeConfig;
const gpsLoraConfValidator = require('../../utils/validators/gps-lora-configs-validator.js').gpsLoraConfValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const writeConfig = ({SETTINGS, data, logger}) => {
    logger.silly('writeConfig');

    const dataMask = {
        ref_latitude: null,
        ref_longitude: null,
        ref_altitude: null,
        fake_gps: null
    };

    let newConfigs = parseObjectByMask(data, dataMask, false);
    logger.silly(newConfigs);
    const validationResult = gpsLoraConfValidator(Object.assign({}, newConfigs, {use_gps: data.use_gps}), logger);
    logger.info('Is valid new configs for write to "global_conf.json" = ' + validationResult.isValid);

    newConfigs.gps_tty_path = (data.use_gps === 'enabled') ? '/dev/ttyO1' : null;

    const result = write({
        SETTINGS,
        data: {gateway_conf: newConfigs},
        logger,
        validator: () => validationResult
    })

    return result;
}

exports.writeConfig = writeConfig;
