const domainAdressValidator = require('../validators').domainAdressValidator;
const providerPhoneValidator = require('../validators').providerPhoneValidator;
const namePassValidator = require('../validators').namePassValidator;
const ipValidator = require('../validators').ipValidator;

const deepMap = require('../objects-utils/deep-map-object.js').deepMap;
const checkBoolObjectForFalse = require('../objects-utils/check-bool-object-for-false.js').checkBoolObjectForFalse;

const oneParamValidator = (field, value) => {
    switch (field) {
        case 'Init2': {
            return domainAdressValidator(value);
        }
        case 'Phone': {
            return providerPhoneValidator(value);
        }
        case 'Password':
        case 'Username': {
            return namePassValidator(value);
        }
        case 'REF_IP1': {
            return ipValidator(value);
        }
        case 'REF_IP2': {
            if (value === '') {
                return true;
            } else {
                return ipValidator(value);
            }
        }
        default: {
            return false;
        }
    }
}

const $3GConfigsValidator = (data, logger) => {
    // TODO: remove code after testing
    /*for (var field in obj) {
        const oneFildCheckResult = oneConfigValidator(field, obj[field], logger);
        if (!oneFildCheckResult) {
            logger.debug(`${field} = [ ${obj[field]} ]`);
            logger.warn(`${field} is valid = ${oneFildCheckResult}`);
            return false;
        }
    }
    return true;*/

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

exports.$3GConfigsValidator = $3GConfigsValidator;
