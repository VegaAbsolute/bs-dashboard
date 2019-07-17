const fs = require('fs');

const readConfig = ({ filePath }) => {
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
	return configs;
}

exports.readConfig = readConfig;
