const fs = require('fs');

const getFrequencyPresetList = ({serverDirName}) => {
    const presets = JSON.parse(fs.readFileSync(serverDirName + '/LoRa-frequency-presets/list.json', 'utf8'));

    let presetList = [];
    for (let key in presets) {
        presetList = [
            ...presetList,
            {
                name: key,
                description: presets[key].description
            }
        ]
    }

    return presetList
}

exports.getFrequencyPresetList = getFrequencyPresetList;
