const fs = require('fs');
const globalConfValidator = require('../utils/lora-global-conf-validator.js').globalConfValidator;
const mergeDeep =  require('../utils/merge-deep.js').mergeDeep;
const removeComentsFromLoraGlobalConf = require('../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;

const writeConfig = ({filePath, data, logger}) => {
    const text = fs.readFileSync(filePath, 'utf8');
    const clearedText = removeComentsFromLoraGlobalConf(text, '/*', '*/')
    const previousConfigs = (JSON.parse(clearedText));

    let newConfigs = data;

    // delete gateway_ID from new configs
    delete newConfigs['gateway_ID'];

    const isValid = globalConfValidator({data: newConfigs, logger});
    logger.info('Is valid new configs for write to "global_conf.json" = ' + isValid);
    // merge configs and write to file
    if (isValid) {
        const resultConfigs = mergeDeep(previousConfigs, {gateway_conf: newConfigs});

        const stringResultConfigs = JSON.stringify(resultConfigs, null, '\t');
        fs.writeFileSync(filePath, stringResultConfigs);
    }

    return isValid;
}

exports.writeConfig = writeConfig;
