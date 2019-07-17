const ipValidator = require('./validators').ipValidator;
const netMaskValidator = require('./validators').netMaskValidator;

const oneParamValidator = (field, value) => {
    let isValid;
    switch (field) {
        case 'address':
        case 'gateway': {
            isValid = ipValidator(value);
            break;
        }
        case 'eth0': {
            isValid = (value === 'dhcp' || value === 'static');
            break;
        }
        case 'netmask': {
            isValid = netMaskValidator(value);
            break;
        }
        default: {
            isValid = true;
        }
    }

    return isValid;
}

const networkConfValidator = ({data, logger}) => {
    let result = true;
    const deepObj = (object) => {
        for(var prop in object) {
            if (typeof object[prop] === 'object') {
                deepObj(object[prop]);
            } else {
                result = oneParamValidator(prop, object[prop]);
                if (!result) {
                    logger.verbose(prop + ': [' + object[prop] + '] is valid = ' + result);
                    break;
                }
            }
        }
        return result;
    }
    return deepObj(data);
}

exports.networkConfValidator = networkConfValidator;
