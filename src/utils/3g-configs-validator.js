const providerAdressValidator = require('./validators').providerAdressValidator;
const providerPhoneValidator = require('./validators').providerPhoneValidator;
const namePassValidator = require('./validators').namePassValidator;

const oneConfigValidator = (field, value) => {
    switch (field) {
        case 'Init2': {
            return providerAdressValidator(value);
        }
        case 'Phone': {
            return providerPhoneValidator(value);
        }
        case 'Password':
        case 'Username': {
            return namePassValidator(value);
        }
        default: {
            return false;
        }
    }
}

const $3GConfigsValidator = ({data: obj, logger}) => {
    for (var field in obj) {
        const oneFildCheckResult = oneConfigValidator(field, obj[field]);
        if (!oneFildCheckResult) {
            logger.verbose(`${field} : [ ${obj[field]} ] is valid = ${oneFildCheckResult}`);
            return false;
        }
    }
    return true;
}

exports.$3GConfigsValidator = $3GConfigsValidator;
