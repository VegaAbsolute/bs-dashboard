const fs = require('fs');
const removeComentsFromLoraGlobalConf = require('../../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const readConfig = ({filePath, logger}) => {
	logger.silly('readConfig');
	const configsText = fs.readFileSync(filePath, 'utf8');
    const clearedText = removeComentsFromLoraGlobalConf(configsText, '/*', '*/')
	const configsObject = JSON.parse(clearedText);

    const configsMask = {
        SX1301_conf: {
            radio_0: {
                freq: null
            },
            radio_1: {
                freq: null
            },
            chan_multiSF_0: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_1: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_2: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_3: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_4: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_5: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_6: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_7: {
                enable: null,
                radio: null,
                if: null
            },
            chan_Lora_std: {
                enable: null,
                radio: null,
                if: null,
                bandwidth: null,
                spread_factor: null
            },
            chan_FSK: {
                enable: null,
                radio: null,
                if: null,
                bandwidth: null,
                datarate: null
            }
        }
    }

    const sendConfigs = parseObjectByMask(configsObject, configsMask);
	logger.silly(sendConfigs);
	return sendConfigs;
}

exports.readConfig = readConfig;
