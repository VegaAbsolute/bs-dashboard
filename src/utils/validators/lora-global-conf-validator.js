const portValidator = require('../validators').portValidator;
const ipValidator = require('../validators').ipValidator;
const domainAdressValidator = require('../validators').domainAdressValidator;

const deepMap = require('../objects-utils/deep-map-object.js').deepMap;
const checkBoolObjectForFalse = require('../objects-utils/check-bool-object-for-false.js').checkBoolObjectForFalse;

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
            } else if (domainAdressValidator(value)) {
                isValid = true;
            } else if (value === 'localhost') {
                isValid = true;
            }
            break;
        }
        default: {
            isValid = false;
        }
    }

    return isValid;
}

const globalConfValidator = ({data, logger}) => {
    // TODO: remove code after testing
    /*let result = false;
    const deepObj = (object) => {
        for(var prop in object) {
            if (typeof object[prop] === 'object') {
                deepObj(object[prop]);
            } else {
                result = oneParamValidator(prop, object[prop]);
                if (!result) {
                    logger.warn(prop + ': [' + object[prop] + '] is valid = ' + result);
                    break;
                }
            }
        }
        return result;
    }
    return deepObj(data);*/

    return checkBoolObjectForFalse(deepMap(data, (field, value, path) => {
        logger.debug(`${path} = [ ${value} ]`);
        const result = oneParamValidator(field, value);
        if (!result) {
            logger.warn(`${path} is valid = ${result}`);
        } else {
            logger.verbose(`${path} is valid = ${result}`);
        };
        return result;
    }));
}

exports.globalConfValidator = globalConfValidator;
