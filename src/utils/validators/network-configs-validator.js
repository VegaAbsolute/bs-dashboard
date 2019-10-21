const ipValidator = require('../validators').ipValidator;
const netMaskValidator = require('../validators').netMaskValidator;
const domainAdressValidator = require('../validators').domainAdressValidator;

const deepReduceObject = require('../objects-utils/deep-reduce-object.js').deepReduceObject;

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
    const result = deepReduceObject(data, {isValid: true, msg: []}, (objectKeyPath, keyName, keyValue, prevResult)=>{
        const isValid = oneParamValidator(keyName, keyValue);

        if (!isValid) {
            logger.warn(`${objectKeyPath}.${keyName} is valid = ${isValid}`);
        } else {
            logger.verbose(`${objectKeyPath}.${keyName} is valid = ${isValid}`);
        };

        return {
            isValid: prevResult.isValid ? isValid : false,
            msg: isValid ? prevResult.msg : [...prevResult.msg, `[${objectKeyPath}.${keyName}]_is_not_valid`]
        }
    })

    return result;
}

exports.networkConfValidator = networkConfValidator;
