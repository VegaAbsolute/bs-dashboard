const loraFrequencyConfigsHandler = ({
    cmd,
    filePath,
    defaultFilePath,
    data,
    response,
    dirName: serverDirName,
    logger
}) => {
    logger.debug('loraFrequencyConfigsHandler');
    logger.silly(data);

    switch (cmd) {

        case 'get_freq_conf': {
            logger.silly('handler case: get_freq_conf');
            const readConfig = require('./read-configs.js').readConfig;
            const configs = readConfig({filePath, logger});
            const result = {
                cmd,
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        case 'set_freq_conf': {
            logger.silly('handler case: set_freq_conf');
            const writeConfig = require('./write-config.js').writeConfig;
            if (writeConfig({filePath, data, logger})) {
                response.json({ cmd, result: true, msg: 'success' });
            } else {
                response.json({ cmd, result: false, msg: 'failure' });
            }
            break;
        }

        case 'get_freq_preset_list': {
            logger.silly('handler case: get_freq_preset_list');
            const getFrequencyPresetList = require('./get-preset-list.js').getFrequencyPresetList;
            const configs = getFrequencyPresetList({ serverDirName, logger });
            const result = {
                cmd,
                result: true,
                msg: 'success',
                data: configs
            }
            response.json(result);
            break;
        }

        // TODO: create preset sending
        case 'get_freq_preset': {
            logger.silly('handler case: get_freq_preset');
            const readPreset = require('./read-preset.js').readPreset;
            readPreset({presetName: data.presetName, serverDirName, logger}).then((configs) => {
                if (configs.isSuccess) {
                    const result = {
                        cmd,
                        result: true,
                        msg: 'success',
                        data: configs.result
                    }
                    response.json(result);
                } else {
                    response.json({ cmd, result: false, msg: configs.result });
                }
            })
            break;
        }

        case 'set_freq_preset': {
            logger.silly('handler case: set_freq_preset');
            const setFrequencyPreset = require('./set-preset.js').setFrequencyPreset;
            //setFrequencyPreset(filePath);
            setFrequencyPreset({filePath, data, serverDirName, logger}).then((res)=>{
                if (res) {
                    response.json({ cmd, result: true, msg: 'success' });
                } else {
                    response.json({ cmd, result: false, msg: 'failure' });
                }
            })
            break;
        }

        default: {
            logger.silly('handler case: default');
            logger.warn(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.loraFrequencyConfigsHandler = loraFrequencyConfigsHandler;
