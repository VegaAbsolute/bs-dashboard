const portValidator = require('./validators').portValidator;
const ipValidator = require('./validators').ipValidator;

const oneParamValidator = (field, value) => {
    let isValid;
    switch (field) {
        case 'serv_port_up':
        case 'serv_port_down': {
            isValid = portValidator(value);
            break;
        }
        case 'server_address': {
            isValid = false;
            if (ipValidator(value)) {
                isValid = true;
            } else if (providerAdressValidator(value)) {
                isValid = true;
            } else if (value === 'localhost') {
                isValid = true;
            }
            break;
        }
        default: {
            isValid = true;
        }
    }

    return isValid;
}

const globalConfValidator = ({data, logger}) => {
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

exports.globalConfValidator = globalConfValidator;
