const fs = require('fs');

const checking3GSupport = (isSupported, interfaceManagerFilePath) => {
    switch (isSupported) {
        case 'true': {
            return true;
        }
        case 'false': {
            return false;
        }
        case 'auto': {
            const configsArray = fs.readFileSync(interfaceManagerFilePath, 'utf8').toString().split("\n");
            let configObject = {};
            for (var i in configsArray) {
                const string = configsArray[i].trim();
                if (string.substr(0, 1) !== "#" && string.substr(0, 1) !== "") {
                    const arr = string.split("=");
                    if(arr[0].trim() === 'INTERFACE2') {
                        if (arr[1].trim() === '"ppp0"') {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        default: {
            return false;
        }
    }
}

exports.checking3GSupport = checking3GSupport;
