const fs = require('fs');

const readPreset = ({presetName, serverDirName, logger}) => {
    logger.silly('readPreset');
    return new Promise((resolve, reject) => {
        const presetList = JSON.parse(fs.readFileSync(serverDirName + '/LoRa-frequency-presets/list.json', 'utf8'));
        const selectedPreset = presetList[presetName];
        logger.info(`Selected preset "${presetName}"`);
        if (selectedPreset !== undefined) {
            const presetFileName = selectedPreset.fileName;
            fs.access(serverDirName + `/LoRa-frequency-presets/presets/${presetFileName}`, (error) => {
                if (error) {
                    logger.warn(`File "${presetFileName}" not found!`);
                    return resolve({isSuccess: false, result: `File "${presetFileName}" not found!`});
                } else {

                    const presetConfigs = JSON.parse(fs.readFileSync(serverDirName + `/LoRa-frequency-presets/presets/${presetFileName}`, 'utf8'));
                    logger.silly(presetConfigs);
                    return resolve({isSuccess: true, result: presetConfigs});
                }
            });
        } else {
            logger.warn(`selectedPreset = ${selectedPreset} of [${presetName}]`);
            return resolve({isSuccess: false, result: `ERROR: selectedPreset = ${selectedPreset} of [${presetName}]`});
        }
    })
}

exports.readPreset = readPreset;
