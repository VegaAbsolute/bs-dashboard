const fs = require('fs');
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;
const frequencyConfigsValidator = require('../../utils/validators/frequency-configs-validator.js').frequencyConfigsValidator;
const additionalChannelsValidator = require('../../utils/validators/frequency-configs-validator.js').additionalChannelsValidator;
const removeComentsFromLoraGlobalConf = require('../../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;
const mergeDeep =  require('../../utils/merge-deep.js').mergeDeep;

const writeConfig = ({filePath, data: configs, logger}) => {
    logger.silly('writeConfig');
    const newConfigsMask = {
        radio_0: { freq: null },
        radio_1: { freq: null },
        chan_multiSF_0: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_1: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_2: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_3: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_4: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_5: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_6: {
            enable: null,
            if: null,
            radio: null,
        },
        chan_multiSF_7: {
            enable: null,
            if: null,
            radio: null,
        }
    };
    const additionalChannelsMask = {
        chan_FSK: {
            bandwidth: null,
            datarate: null,
            enable: null,
            if: null,
            radio: null
        },
        chan_Lora_std: {
            bandwidth: null,
            spread_factor: null,
            enable: null,
            if: null,
            radio: null
        }
    };

    // TODO: remove after testing
    /*const {
        radio_0,
        radio_1,
        chan_multiSF_0,
        chan_multiSF_1,
        chan_multiSF_2,
        chan_multiSF_3,
        chan_multiSF_4,
        chan_multiSF_5,
        chan_multiSF_6,
        chan_multiSF_7,
        chan_FSK,
        chan_Lora_std
    } = configs;

    let newConfigs = {
        SX1301_conf: {
            radio_0,
            radio_1,
            chan_multiSF_0,
            chan_multiSF_1,
            chan_multiSF_2,
            chan_multiSF_3,
            chan_multiSF_4,
            chan_multiSF_5,
            chan_multiSF_6,
            chan_multiSF_7
        }
    };
    const additionalChannels = {
        chan_FSK,
        chan_Lora_std
    }*/
    let newConfigs = {
        SX1301_conf: parseObjectByMask(configs, newConfigsMask, false)
    };
    const additionalChannels = parseObjectByMask(configs, additionalChannelsMask, false);

    // check to valid
    logger.silly(additionalChannels);
    const isAddChnValid = additionalChannelsValidator(additionalChannels, logger);

    logger.silly(newConfigs);
    const {
        isDataValid,
        descriptionOfNotValid
    } = frequencyConfigsValidator(newConfigs, logger);

    if (descriptionOfNotValid !== '') {
        logger.verbose(descriptionOfNotValid);
    }

    const validateResult = isAddChnValid && isDataValid;

    logger.info('Is valid new configs for write to "global_conf.json" = ' + validateResult);

    // merge configs and write to file
    if (validateResult) {
        const configsText = fs.readFileSync(filePath, 'utf8');
        const clearedText = removeComentsFromLoraGlobalConf(configsText, '/*', '*/')
    	const previousConfigs = JSON.parse(clearedText);

        const preparedConfigs = mergeDeep({SX1301_conf: additionalChannels}, newConfigs);

        const resultConfigs = mergeDeep(previousConfigs, preparedConfigs);
        const stringResultConfigs = JSON.stringify(resultConfigs, null, '\t');

        fs.writeFileSync(filePath, stringResultConfigs);
    }

    return validateResult;
}

exports.writeConfig = writeConfig;
