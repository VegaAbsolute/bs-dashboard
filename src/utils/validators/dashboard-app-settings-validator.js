const deepMap = require('../objects-utils/deep-map-object.js').deepMap;
const checkBoolObjectForFalse = require('../objects-utils/check-bool-object-for-false.js').checkBoolObjectForFalse;

const oneParamValidator = (field, value) => {
    switch (field) {
        case 'isSupported': {
            switch (value) {
                case 'auto':
                case 'true':
                case 'false': {
                    return true;
                }
                default: {
                    return false;
                }
            }
        }
        case 'loggerLevel': {
            if (typeof value === 'string') {
                return true;
            }
            return false;
        }

        default: {
            return false;
        }
    }
}

const dashboardAppSettingsValidator = (data, logger) => {
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
    }*/


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

exports.dashboardAppSettingsValidator = dashboardAppSettingsValidator;
