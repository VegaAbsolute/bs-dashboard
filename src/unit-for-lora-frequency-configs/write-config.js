const fs = require('fs');
const frequencyConfigsValidator = require('../utils/frequency-configs-validator.js').frequencyConfigsValidator;
const removeComentsFromLoraGlobalConf = require('../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;
const mergeDeep =  require('../utils/merge-deep.js').mergeDeep;

const writeConfig = ({filePath, data: configs, logger}) => {
    let newConfigs = {
        SX1301_conf: configs
    };

    // check to valid
    const {
        isDataValid,
        descriptionOfNotValid
    } = frequencyConfigsValidator({configs, logger});
    if (descriptionOfNotValid !== '') {
        logger.verbose(descriptionOfNotValid);
    }
    logger.info('Is valid new configs for write to "global_conf.json" = ' + isDataValid);

    // merge configs and write to file
    if (isDataValid) {
        const configsText = fs.readFileSync(filePath, 'utf8');
        const clearedText = removeComentsFromLoraGlobalConf(configsText, '/*', '*/')
    	const previousConfigs = JSON.parse(clearedText);

        const resultConfigs = mergeDeep(previousConfigs, newConfigs);
        const stringResultConfigs = JSON.stringify(resultConfigs, null, '\t');

        fs.writeFileSync(filePath, stringResultConfigs);
    }

    return isDataValid;
}

exports.writeConfig = writeConfig;
