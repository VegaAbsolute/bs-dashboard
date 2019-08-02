const ipWithPortValidator = require('../validators').ipWithPortValidator;
const domainAdressWithoutProtocolValidator = require('../validators').domainAdressWithoutProtocolValidator;
const numberValidator = require('../validators').numberValidator;
const partOfUrlPathValidator = require('../validators').partOfUrlPathValidator;

const deepMap = require('../objects-utils/deep-map-object.js').deepMap;
const checkBoolObjectForFalse = require('../objects-utils/check-bool-object-for-false.js').checkBoolObjectForFalse;

const oneParamValidator = (field, value) => {
    switch (field) {
        case 'GIT_NAME':
        case 'GIT_REPO': {
            return partOfUrlPathValidator(value);
        }

        case 'GIT_DOMAIN': {
            let isValid = false;
            if (ipWithPortValidator(value)) {
                return true;
            } else if (domainAdressWithoutProtocolValidator(value)) {
                return true;
            } else if (value === 'localhost') {
                return true;
            }
            return false
        }

        case 'GIT_PROVIDER': {
            switch (value) {
                case 'GIT_LAB':
                case 'GIT_HUB': {
                    return true;
                }
                default: {
                    return false;
                }
            }
        }

        case 'TIME_INTERVAL_IN_MINUTES': {
            return numberValidator(value, 0, 9999);
        }

        case 'loggerLevel': {
            if (typeof value === 'string') {
                return true;
            }
            return false;
        }

        case 'SERVER_STARTUP_METHOD': {
            switch (value) {
                case 'automatically':
                case 'button': {
                    return true;
                }
                default: {
                    return false;
                }
            };
        }


        default: {
            return false;
        }
    }
}

const appManagerSettingsValidator = (data, logger) => {
    // TODO: remove code after testing
    /*let result = false;
    const deepObj = (object) => {
        for(var prop in object) {
            if (typeof object[prop] === 'object') {
                if (!deepObj(object[prop])){
                    return false;
                }
            } else {
                result = oneParamValidator(prop, object[prop]);
                logger.verbose(prop + ': [' + object[prop] + '] is valid = ' + result);
                if (!result) {
                    logger.warn(prop + ': [' + object[prop] + '] is valid = ' + result);
                    return result;
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

exports.appManagerSettingsValidator = appManagerSettingsValidator;
