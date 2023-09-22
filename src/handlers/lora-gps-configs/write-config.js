const write = require('../../utils/lora-config-files-actions/write-config.js').writeConfig;
const gpsLoraConfValidator = require('../../utils/validators/gps-lora-configs-validator.js').gpsLoraConfValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const writeConfig = ({SETTINGS, PROD_INFO, data, logger}) => {
    logger.silly('writeConfig');

    let softwareRevision = 1;
    let tempSoftwareRevision = NaN;

    let validPROD_INFO = typeof PROD_INFO === 'object' && PROD_INFO !== null;
    let validSoftwareRevision = validPROD_INFO && PROD_INFO.Software_revision;
    if(validSoftwareRevision) tempSoftwareRevision = parseInt(PROD_INFO.Software_revision);
    

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

    if (PROD_INFO.Board_revision === "05" || PROD_INFO.Board_revision === "06" || PROD_INFO.Board_revision === "07") {
        newConfigs.gps_tty_path =
                data.use_gps === "enabled" ? "/dev/ttymxc2" : null;
    } else {
        if (softwareRevision >= 2)
            newConfigs.gps_tty_path =
                data.use_gps === "enabled" ? "/dev/ttyS1" : null;
        else
            newConfigs.gps_tty_path =
                data.use_gps === "enabled" ? "/dev/ttyO1" : null;
    }

    if (PROD_INFO.Board_revision === "06" || PROD_INFO.Board_revision === "07") {
        newConfigs.gps_active_script =
                data.use_gps === "enabled" ? "echo default-on >/sys/class/leds/led-gps/trigger" : "exit 0";
        newConfigs.gps_passive_script =
                data.use_gps === "enabled" ? "echo heartbeat > /sys/class/leds/led-gps/trigger" : "exit 0";
    }

    const result = write({
        SETTINGS,
        data: {gateway_conf: newConfigs},
        logger,
        validator: () => validationResult
    })

    return result;
}

exports.writeConfig = writeConfig;
