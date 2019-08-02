const fs = require('fs');

const readConfig = ({ filePath, interfaceManagerFilePath, logger }) => {
    /**
     * Read main configs
     */
    logger.debug('Read main configs');
    const configsArray = fs.readFileSync(filePath, 'utf8').toString().split("\n");
    let configs = {
        Init2: '',
        Phone: '',
        Password: '',
        Username: ''
    };

    for (var i in configsArray) {
        if (configsArray[i].substr(0, 1) !== ';') {
            const index = configsArray[i].indexOf('=');
            if (index > -1) {
                const field = configsArray[i].substring(0, index).trim();
                for (var key in configs) {
                    if (key === field) {
                        let value = configsArray[i].substring(index + 1).split(",");
                        for (var j in value) {
                            value[j] = value[j].split('"').join('').trim();
                        }
                        configs[key] = value[value.length - 1];
                    }
                }
            }
        }
    }
    logger.silly(configs);

    /**
     * Read configs for ping
     */
    logger.debug('Read configs for ping');
    let pingConfigs = {}
    const interfaceManagerFileArray = fs.readFileSync(interfaceManagerFilePath, 'utf8').toString().split("\n");
    // Fetch require configs
    for (var i in interfaceManagerFileArray) {
        const indexOfSeparator = interfaceManagerFileArray[i].indexOf('=');
        if (indexOfSeparator > 0) {
            const key = interfaceManagerFileArray[i].substring(0, indexOfSeparator).trim();
            const val = interfaceManagerFileArray[i].substring(indexOfSeparator + 1).trim().split('"').join('');
            switch (key) {
                case 'REF_IP1': {
                    pingConfigs = Object.assign(pingConfigs, {REF_IP1: val})
                    break;
                }
                case 'REF_IP2': {
                    pingConfigs = Object.assign(pingConfigs, {REF_IP2: val})
                    break;
                }
                default: {}
            }
        }
    }
    logger.silly(pingConfigs);

	return Object.assign({}, configs, pingConfigs);
}

exports.readConfig = readConfig;
