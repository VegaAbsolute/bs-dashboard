const ipValidator = require('../validators').ipValidator;
const netMaskValidator = require('../validators').netMaskValidator;
const domainAdressValidator = require('../validators').domainAdressValidator;

const deepMap = require('../objects-utils/deep-map-object.js').deepMap;
const checkBoolObjectForFalse = require('../objects-utils/check-bool-object-for-false.js').checkBoolObjectForFalse;

const oneParamValidator = (field, value) => {
    let isValid;
    switch (field) {
        case 'address':
        case 'gateway':
        case 'nameserver0':
        case 'nameserver1': {
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
        case 'domain': {
            isValid = domainAdressValidator(value);
            break;
        }
        default: {
            isValid = false;
        }
    }

    return isValid;
}

const networkConfValidator = ({data, logger}) => {
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

exports.networkConfValidator = networkConfValidator;
