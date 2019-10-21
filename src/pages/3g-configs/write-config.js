const $3GConfigsValidator = require('../../utils/validators/3g-configs-validator.js').$3GConfigsValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;
const fs = require('fs');

const writeConfig = ({filePath, interfaceManagerFilePath, data: dataObj, logger}) => {
    logger.debug('write config');
    const dataMask = {
        Init2: null,
        Phone: null,
        Password: null,
        Username: null
    };
    const pingConfigsMask = {
        REF_IP1: null,
        REF_IP2: null
    };
    let data = parseObjectByMask(dataObj, dataMask, false);
    const pingConfigs = parseObjectByMask(dataObj, pingConfigsMask, false);

    // TODO: remove after testing
    /*const {
        Init2,
        Phone,
        Password,
        Username,
        REF_IP1,
        REF_IP2
    } = dataObj;

    let data = {
        Init2,
        Phone,
        Password,
        Username
    };

    const pingConfigs = {
        REF_IP1,
        REF_IP2
    };*/

    data['Init2'] = data['Init2'].toLowerCase();

    logger.silly(data);
    const isMainConfigsValid = $3GConfigsValidator(data, logger);

    logger.silly(pingConfigs);
    const isPingConfigsValid = $3GConfigsValidator(pingConfigs, logger);

    const isValid = (isMainConfigsValid.isValid && isPingConfigsValid.isValid);
    logger.info('Is valid new configs for write to "wvdial.conf" = ' + isValid);

    if (isValid) {
        /**
         * Write main configs
         */
        logger.debug('write main config');
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

        /**
         * Write ping configs
         */
        logger.debug('write ping configs');
        let resultInterfaceManagerArray = []
        const interfaceManagerFileArray = fs.readFileSync(interfaceManagerFilePath, 'utf8').toString().split("\n");
        // Fetch require configs
        for (var i in interfaceManagerFileArray) {
            const indexOfSeparator = interfaceManagerFileArray[i].indexOf('=');
            if (indexOfSeparator > 0) {
                const key = interfaceManagerFileArray[i].substring(0, indexOfSeparator).trim();
                switch (key) {
                    case 'REF_IP1': {
                        resultInterfaceManagerArray = [
                            ...resultInterfaceManagerArray,
                            `REF_IP1="${pingConfigs.REF_IP1}"`
                        ]
                        break;
                    }
                    case 'REF_IP2': {
                        resultInterfaceManagerArray = [
                            ...resultInterfaceManagerArray,
                            `REF_IP2="${pingConfigs.REF_IP2}"`
                        ]
                        break;
                    }
                    default: {
                        resultInterfaceManagerArray = [
                            ...resultInterfaceManagerArray,
                            interfaceManagerFileArray[i]
                        ]
                    }
                }
            } else {
                resultInterfaceManagerArray = [
                    ...resultInterfaceManagerArray,
                    interfaceManagerFileArray[i]
                ]
            }
        }

        let interfaceManagerResult = '';
        for (let i in resultInterfaceManagerArray) {
            if (i > 0) {
                interfaceManagerResult += '\n';
            }
            interfaceManagerResult += resultInterfaceManagerArray[i];
        }
        fs.writeFileSync(interfaceManagerFilePath, interfaceManagerResult);
    }

    return {isValid: isValid, msg: [...isMainConfigsValid.msg, ...isPingConfigsValid.msg]};
}

exports.writeConfig = writeConfig;
