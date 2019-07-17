const frequencyConfigsValidator = ( {configs:obj, logger} ) => {

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

    return {
        isDataValid: validationResult,
        descriptionOfNotValid: descriptionOfNotValid.substr(0, descriptionOfNotValid.length - 2)
    };
}

exports.frequencyConfigsValidator = frequencyConfigsValidator;
