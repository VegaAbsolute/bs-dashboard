    // TODO: remake validation for additional channels!
const additionalChannelsValidator = (obj, logger) => {
    const numberValidator = require('../validators.js').numberValidator;
    let result = false;
    for (let channelName in obj) {
        for (let field in obj[channelName]) {
            switch (field) {
                case 'if':
                case 'bandwidth':
                case 'datarate':
                case 'spread_factor': {
                    if (!numberValidator(obj[channelName][field], -999999999, 999999999)) {
                        logger.warn(`${channelName}.${field} = ${obj[channelName][field]} is not valid!`);
                        return false;
                    }
                    result = true;
                    break;
                }
                case 'radio': {
                    if (obj[channelName][field] !== 0 && obj[channelName][field] !== 1) {
                        logger.warn(`${channelName}.${field} = ${obj[channelName][field]} is not valid!`);
                        return false;
                    }
                    result = true;
                    break;
                }
                case 'enable': {
                    if (typeof obj[channelName][field] !== 'boolean') {
                        logger.warn(`${channelName}.${field} = ${obj[channelName][field]} is not valid!`);
                        return false;
                    }
                    result = true;
                    break;
                }
                default: {
                    return false;
                }
            }
        }
    }
    logger.verbose('additionalChannelsValidator result = true')
    return result;
}


/**
 * Check for valid main radiochannels:
 */
const frequencyConfigsValidator = (obj, logger) => {

    let data = {};
	let radios = {};
	for (var key in obj) {
		const fieldType = key.substr(0,4);
		switch (fieldType) {
			case 'chan': {
				data[key] = obj[key];

				break;
			}
			case 'radi': {
				radios[key] = obj[key];
				break;
			}
			default: {
				break;
			}
		}
	}

    let descriptionOfNotValid = "";
    let validationResult = true;
    let channels = [];

    for (let key in data) {
        if (data[key].enable) {

            /**
             *  Check elements to includes in the range of radio.
             */
            if (data[key].if < -400000 || data[key].if > 400000) {
                descriptionOfNotValid += `${'radio_'+data[key].radio}: [${key}: (${data[key].if})] not included in the range\r\n`;
                validationResult = false;
            };

            /**
             *  Check radios frequency valid
             */
            if (radios['radio_'+data[key].radio].freq < 863000000 || radios['radio_'+data[key].radio].freq > 870000000) {
                descriptionOfNotValid += `Radio frequency = ${radios['radio_'+data[key].radio].freq} of the radio "${'radio_'+data[key].radio}" not included in the range (863000000 - 870000000)\r\n`;
                validationResult = false;
            };

            /*
            *   Fill channels array
            */
            channels = [
                ...channels,
                Object.assign({}, data[key], {
                    channelName: key,
                    if: data[key].if+radios['radio_'+data[key].radio].freq
                })
            ];
        }
    }

    /*
    *   Check intervals between elements
    */
    if (channels.length > 0) {
        channels.sort(( a, b ) =>  a.if - b.if).reduce((prev, current)=>{
            const diff = current.if - prev.if;
            if ((diff) < 200000) {
                validationResult = false;
                descriptionOfNotValid += `[${prev.channelName}: ${prev.if}]<--${diff}-->[${current.channelName}: ${current.if}] interval smaller than 200000\r\n`
            } else {
            }
            return current;
        })
    }
    logger.warn(descriptionOfNotValid.substr(0, descriptionOfNotValid.length - 2));
    return {
        isDataValid: validationResult,
        descriptionOfNotValid: descriptionOfNotValid.substr(0, descriptionOfNotValid.length - 2)
    };
}

exports.frequencyConfigsValidator = frequencyConfigsValidator;
exports.additionalChannelsValidator = additionalChannelsValidator;
