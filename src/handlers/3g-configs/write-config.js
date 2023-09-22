const $3GConfigsValidator = require('../../utils/validators/3g-configs-validator.js').$3GConfigsValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;
const fs = require('fs');

function writeConfogs_r1 ( data, path, logger )
{
    logger.debug('write main config');
    // read file into array
    const configsArray = fs.readFileSync(path, 'utf8').toString().split("\n");
    let configs = [];

    // split array into 'configs' array
    for (var i in configsArray) {
        const index = configsArray[i].indexOf('=');
        if (index > -1) {
            const field = configsArray[i].substring(0, index).trim();
            let value = configsArray[i].substring(index + 1).split(",");
            for (var j in value) {
                value[j] = value[j].trim();
            }
            // insert new configs into 'configs' array
            for (var key in data) {
                if (field === key) {
                    if (field === 'Init2') {
                        value[2] = '"' + data[key] + '"';
                    } else {
                        value[0] = data[key];
                    }
                }
            }
            configs[i] = [field + ' = ', ...value]
        } else {
            if (configsArray[i] !== '') {
                configs[i] = [configsArray[i]];
            }
        }
    }

    let result = '';
    for (var i in configs) {
        let row = '';
        for (var j in configs[i]) {
            row += configs[i][j];
            row += ( j > 0 & j < configs[i].length - 1 ) ? ', ' : '';
        }
        result += row;
        result += ( i < configs.length - 1 ) ? '\n' : '';
    }
    // write configs into file
    fs.writeFileSync(path, result);
    return true;
}
function writePingConfigs_r1 ( configs, path, logger )
{
    /**
     * Write ping configs
     */
    logger.debug('write ping configs');
    let resultInterfaceManagerArray = []
    const interfaceManagerFileArray = fs.readFileSync(path, 'utf8').toString().split("\n");
    // Fetch require configs
    for (var i in interfaceManagerFileArray) {
        const indexOfSeparator = interfaceManagerFileArray[i].indexOf('=');
        if (indexOfSeparator > 0) {
            const key = interfaceManagerFileArray[i].substring(0, indexOfSeparator).trim();
            switch (key) {
                case 'REF_IP1': {
                    resultInterfaceManagerArray = [
                        ...resultInterfaceManagerArray,
                        `REF_IP1="${configs.REF_IP1}"`
                    ]
                    break;
                }
                case 'REF_IP2': {
                    resultInterfaceManagerArray = [
                        ...resultInterfaceManagerArray,
                        `REF_IP2="${configs.REF_IP2}"`
                    ]
                    break;
                }
                default: {
                    resultInterfaceManagerArray = [
                        ...resultInterfaceManagerArray,
                        interfaceManagerFileArray[i]
                    ]
                }
            }
        } else {
            resultInterfaceManagerArray = [
                ...resultInterfaceManagerArray,
                interfaceManagerFileArray[i]
            ]
        }
    }

    let interfaceManagerResult = '';
    for (let i in resultInterfaceManagerArray) {
        if (i > 0) {
            interfaceManagerResult += '\n';
        }
        interfaceManagerResult += resultInterfaceManagerArray[i];
    }
    fs.writeFileSync(path, interfaceManagerResult);
    return true;
}
function writeConfigs_r2 ( configs, pingConfigs, path, logger )
{
    logger.debug('write ping configs and 3G configs');
    let data = '';
    if ( configs.Init2 ) data += `APN=${configs.Init2}\n`;
    if ( configs.Phone ) data += `Phone=${configs.Phone}\n`;
    if ( configs.Password ) data += `Password=${configs.Password}\n`;
    if ( configs.Username ) data += `Username=${configs.Username}\n`;
    if ( pingConfigs.REF_IP1 ) data += `RefIP1=${pingConfigs.REF_IP1}\n`;
    if ( pingConfigs.REF_IP2 ) data += `RefIP2=${pingConfigs.REF_IP2}\n`;
    fs.writeFileSync( path, data );
    return true;
}

function writeProviderConfig_r5(path, apn, phone){
    const apnRegexp = /(?<="IP",")([^"]*)(?=")/;
    const phoneRegexp = /(?<=ATD)(\*\d+#)/;

    let providerData = fs.readFileSync(path, "utf8");

    const apnMatch = providerData.match(apnRegexp);
    if (apnMatch.length > 0) {
        providerData = providerData.replace(apnRegexp, apn);
    }

    const phoneMatch = providerData.match(phoneRegexp);
    if (phoneMatch.length > 0) {
        providerData = providerData.replace(phoneRegexp, phone);
    }

    fs.writeFileSync(path, providerData);
}

function writeUsersConfig_r5(path, user1Login, user1Pass, user2Login, user2Pass){
    let userData = fs.readFileSync(path, "utf8");
    const rows = userData.split("\n");
    rows[2] = `${user1Login || "\"\""} * ${user1Pass || "\"\""} *`;
    rows[3] = `${user2Login || "\"\""} * ${user2Pass || "\"\""} *`;
    const result = rows.join("\n");
    fs.writeFileSync(path, result);
}

function writeInterfaceTesterConfig_r5(path, ip1, ip2) {
    const ipModemRegexp =
        /(?<=test_ip_via_modem=)((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/;
    const ipEthernetRegexp =
        /(?<=test_ip_via_ethernet=)((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/;

    let interfaceData = fs.readFileSync(path, "utf8");

    const ipModemMatch = interfaceData.match(ipModemRegexp);
    if (ipModemMatch.length > 0) {
        interfaceData = interfaceData.replace(ipModemRegexp, ip1);
    }

    const ipEthernetMatch = interfaceData.match(ipEthernetRegexp);
    if (ipEthernetMatch.length > 0) {
        interfaceData = interfaceData.replace(ipEthernetRegexp, ip2);
    }
    
    fs.writeFileSync(path, interfaceData);
}

function writeConfigs_r5 (wireless3GConfigs, data, logger){
    logger.debug('write ping configs and 3G configs');

    const Init2 = data.Init2 || "internet";
    const Phone = data.Phone || "*99#";
    const Username = data.Username || "";
    const Password = data.Password || "";
    const Init22 = data.Init22 || "internet";
    const Phone2 = data.Phone2 || "*99#";
    const Username2 = data.Username2 || "";
    const Password2 = data.Password2 || "";
    const REF_IP1 = data.REF_IP1 || '8.8.8.8';
    const REF_IP2 = data.REF_IP2 || '8.8.8.8';

    //validation
    const tempData1 = {
        Init2: Init2,
        Phone: Phone,
        Username: Username,
        Password: Password,
    }

    const tempData2 = {
        Init2: Init22,
        Phone: Phone2,
        Username: Username2,
        Password: Password2,
    }

    const pingConfig = {
        REF_IP1: REF_IP1,
        REF_IP2: REF_IP2,
    }

    const isConfig1Valid = $3GConfigsValidator(tempData1, logger);
    const isConfig2Valid = $3GConfigsValidator(tempData2, logger);
    const isPingConfigValid = $3GConfigsValidator(pingConfig, logger);
    const isValid = isConfig1Valid.isValid && isConfig2Valid.isValid && isPingConfigValid.isValid;
    if(!isValid){
        return {isValid: isValid, msg: [...isConfig1Valid.msg, ...isConfig2Valid.msg, ...isPingConfigValid.msg]};
    }

    // providers ( apn, phone )
    // ppp/provider1-connect-chat
    const provider1Path = wireless3GConfigs.providerFileDir + wireless3GConfigs.providerFileName1;
    writeProviderConfig_r5(provider1Path, Init2, Phone); 
    // ppp/provider2-connect-chat
    const provider2Path = wireless3GConfigs.providerFileDir + wireless3GConfigs.providerFileName2;
    writeProviderConfig_r5(provider2Path, Init22, Phone2); 

    // chap-secrets / pap-secrets
    const usersPath1 = wireless3GConfigs.usersFileDir + wireless3GConfigs.usersFileName1;
    const usersPath2 = wireless3GConfigs.usersFileDir + wireless3GConfigs.usersFileName2;
    writeUsersConfig_r5(usersPath1, Username, Password, Username2, Password2);
    writeUsersConfig_r5(usersPath2, Username, Password, Username2, Password2);

    // etc/interface_tester/interface_tester.cfg
    const interfaceConfigPath = wireless3GConfigs.interfaceTesterFileDir + wireless3GConfigs.interfaceTesterFileName;
    writeInterfaceTesterConfig_r5(interfaceConfigPath, REF_IP1, REF_IP2);
    return { isValid };
}

const writeConfig = ({softwareRevision,filePath, interfaceManagerFilePath, data: dataObj, logger}) => {
    logger.debug('write config');

    const dataMask = {
        Init2: null,
        Phone: null,
        Password: null,
        Username: null
    };
    const pingConfigsMask = {
        REF_IP1: null,
        REF_IP2: null
    };
    let data = parseObjectByMask(dataObj, dataMask, false);
    const pingConfigs = parseObjectByMask(dataObj, pingConfigsMask, false);

    // TODO: remove after testing
    /*const {
        Init2,
        Phone,
        Password,
        Username,
        REF_IP1,
        REF_IP2
    } = dataObj;

    let data = {
        Init2,
        Phone,
        Password,
        Username
    };

    const pingConfigs = {
        REF_IP1,
        REF_IP2
    };*/

    data['Init2'] = data['Init2'].toLowerCase();

    logger.silly(data);
    const isMainConfigsValid = $3GConfigsValidator(data, logger);

    logger.silly(pingConfigs);
    const isPingConfigsValid = $3GConfigsValidator(pingConfigs, logger);

    const isValid = (isMainConfigsValid.isValid && isPingConfigsValid.isValid);
    logger.info('Is valid new configs for write to "wvdial.conf" = ' + isValid);

    if (isValid) {
        /**
         * Write main configs
         */
        if ( softwareRevision >= 2 ) 
        {
            writeConfigs_r2 ( data, pingConfigs, filePath, logger );
        }
        else
        {
            writeConfogs_r1 ( data, filePath, logger );
            writePingConfigs_r1 ( pingConfigs, interfaceManagerFilePath, logger );
        }  
    }

    return {isValid: isValid, msg: [...isMainConfigsValid.msg, ...isPingConfigsValid.msg]};
}

exports.writeConfig = writeConfig;
module.exports.writeConfigs_r5 = writeConfigs_r5;
