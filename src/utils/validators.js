const portValidator = (data) => {
    let text = '' + data;
    number = Number.parseInt(text);

    if (isNaN(number)) {
        return false;
    }
    if (number < 0 || number > 65535) {
        return false;
    }
    return true;
}

const ipValidator = (str) => {
    let workString = '' + str;
    let isValid = true;
    const ipArray = str.split(".");

    if (ipArray.length !== 4) {
        return false;
    }
    for (var i = 0; i < ipArray.length; i++) {
        const number = Number.parseInt(ipArray[i]);
        if (isNaN(number)) {
            isValid = false;
            break;
        } else if (number < 0 || number > 255) {
            isValid = false;
            break;
        }
    }
    return isValid;
}

const netMaskValidator = (str) => {

    const binar = (number) => {
    	let binarString = number.toString(2)
        const length = binarString.length;
    	for (var i = 0; i < 8 - length; i += 1) {
    		binarString = "0" + binarString;
    	}
    	return binarString;
    }

    const maskArrayString = str.split(".");
    if (maskArrayString.length !== 4) {
        return false;
    }

    let mask = '';
    for (var i = 0; i < maskArrayString.length; i++) {
        const number = Number.parseInt(maskArrayString[i]);
        if (isNaN(number)) {
            return false;
        } else if (number < 0 || number > 255) {
            return false;
        } else {
            mask += binar(number)
        }
    }
    //console.log('mask =' + mask, 2);

    let maskState = '1';
    for (var i = 0; i < mask.length; i++) {
        const currentMask = mask.substr(i, 1);
        switch (maskState) {
            case '1': {
                if (currentMask === '1') {

                } else if (currentMask === '0') {
                    maskState = '0';
                } else {
                    return false;
                }
                break;
            }
            case '0': {
                if (currentMask === '1') {
                    return false;
                } else if (currentMask === '0') {

                } else {
                    return false;
                }
                break;
            }
            default: {
                return false;
            }
        }
    }

    if (maskState === '1') {
        return false;
    }

    return true;
}

const providerAdressValidator = (str) => {
    const re = /^((http[s]?:\/\/)?[a-z0-9_-]{0,12}[a-z0-9]{1,1}\.){1,4}[a-z]{2,4}$/;
    const valid = re.test(str);
    return valid;
}

const providerPhoneValidator = (str) => {
    const re = /^[*]{1,1}[0-9*#]+[#]{1,1}$/;
    const valid = re.test(str);
    return valid;
}

const namePassValidator = (str) => {
    const re = /^[a-z0-9]{1,16}$/i; //  i - игнорировать регистр
    const valid = re.test(str);
    return valid;
}

exports.providerAdressValidator = providerAdressValidator;
exports.providerPhoneValidator = providerPhoneValidator;
exports.namePassValidator = namePassValidator;
exports.portValidator = portValidator;
exports.ipValidator = ipValidator;
exports.netMaskValidator = netMaskValidator;
