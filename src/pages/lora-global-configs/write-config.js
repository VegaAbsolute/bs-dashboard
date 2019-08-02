const fs = require('fs');
const globalConfValidator = require('../../utils/validators/lora-global-conf-validator.js').globalConfValidator;
const mergeDeep =  require('../../utils/merge-deep.js').mergeDeep;
const removeComentsFromLoraGlobalConf = require('../../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const writeConfig = ({filePath, data, logger}) => {
    logger.silly('writeConfig');
    const text = fs.readFileSync(filePath, 'utf8');
    const clearedText = removeComentsFromLoraGlobalConf(text, '/*', '*/')
    const previousConfigs = (JSON.parse(clearedText));

    const dataMask = {
        gateway_conf:{
            server_address: null,
            serv_port_up: null,
            serv_port_down: null
        }
    };
    const newConfigs = parseObjectByMask({gateway_conf: data}, dataMask, false);
    logger.silly(newConfigs);

    const isValid = globalConfValidator({data: newConfigs, logger});
    logger.info('Is valid new configs for write to "global_conf.json" = ' + isValid);
    // merge configs and write to file
    if (isValid) {
        const resultConfigs = mergeDeep(previousConfigs, newConfigs);

        const stringResultConfigs = JSON.stringify(resultConfigs, null, '\t');
        fs.writeFileSync(filePath, stringResultConfigs);
    }

    return isValid;
}

exports.writeConfig = writeConfig;
