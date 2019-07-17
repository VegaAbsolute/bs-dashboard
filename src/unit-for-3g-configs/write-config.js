const $3GConfigsValidator = require('../utils/3g-configs-validator.js').$3GConfigsValidator;
const fs = require('fs');

const writeConfig = ({filePath, data: dataObj, logger}) => {
    let data =  Object.assign({}, dataObj);

    data['Init2'] = data['Init2'].toLowerCase();

    const isValid = $3GConfigsValidator({data, logger});
    logger.info('Is valid new configs for write to "wvdial.conf" = ' + isValid);

    if (isValid) {
        // read file into array
        const configsArray = fs.readFileSync(filePath, 'utf8').toString().split("\n");
        let configs = [];

        // split array into 'configs' array
        for (var i in configsArray) {
            const index = configsArray[i].indexOf('=');
            if (index > -1) {
                const field = configsArray[i].substring(0, index).trim();
                let value = configsArray[i].substring(index + 1).split(",");
                for (var j in value) {
                    value[j] = value[j].trim();
                }
                // insert new configs into 'configs' array
                for (var key in data) {
                    if (field === key) {
                        if (field === 'Init2') {
                            value[2] = '"' + data[key] + '"';
                        } else {
                            value[0] = data[key];
                        }
                    }
                }
                configs[i] = [field + ' = ', ...value]
            } else {
                if (configsArray[i] !== '') {
                    configs[i] = [configsArray[i]];
                }
            }
        }

        let result = '';
        for (var i in configs) {
            let row = '';
            for (var j in configs[i]) {
                row += configs[i][j];
                row += ( j > 0 & j < configs[i].length - 1 ) ? ', ' : '';
            }
            result += row;
            result += ( i < configs.length - 1 ) ? '\n' : '';
        }

        // write configs into file
        fs.writeFileSync(filePath, result);
    }

    return isValid;
}

exports.writeConfig = writeConfig;
