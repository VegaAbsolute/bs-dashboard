const fs = require("fs");

function parse3GConfig_r1(filePath) {
    const configsArray = fs
        .readFileSync(filePath, "utf8")
        .toString()
        .split("\n");
    let result = {
        Init2: "",
        Phone: "",
        Password: "",
        Username: "",
    };

    for (var i in configsArray) {
        if (configsArray[i].substr(0, 1) !== ";") {
            const index = configsArray[i].indexOf("=");
            if (index > -1) {
                const field = configsArray[i].substring(0, index).trim();
                for (var key in result) {
                    if (key === field) {
                        let value = configsArray[i]
                            .substring(index + 1)
                            .split(",");
                        for (var j in value) {
                            value[j] = value[j].split('"').join("").trim();
                        }
                        result[key] = value[value.length - 1];
                    }
                }
            }
        }
    }
    return result;
}
function parse3GPingConfig_r1(filePath) {
    let result = {};
    const interfaceManagerFileArray = fs
        .readFileSync(filePath, "utf8")
        .toString()
        .split("\n");
    // Fetch require configs
    for (var i in interfaceManagerFileArray) {
        const indexOfSeparator = interfaceManagerFileArray[i].indexOf("=");
        if (indexOfSeparator > 0) {
            const key = interfaceManagerFileArray[i]
                .substring(0, indexOfSeparator)
                .trim();
            const val = interfaceManagerFileArray[i]
                .substring(indexOfSeparator + 1)
                .trim()
                .split('"')
                .join("");
            switch (key) {
                case "REF_IP1": {
                    result = Object.assign(result, { REF_IP1: val });
                    break;
                }
                case "REF_IP2": {
                    result = Object.assign(result, { REF_IP2: val });
                    break;
                }
                default: {
                }
            }
        }
    }
    return result;
}
function parse3GConfig_r2(filePath) {
    let result = {
        configs: {
            Init2: "",
            Phone: "",
            Password: "",
            Username: "",
        },
        pingConfigs: {},
    };
    const arrConfigs = fs.readFileSync(filePath, "utf8").toString().split("\n");
    for (let row of arrConfigs) {
        let itemArr = row.trim().split("=");
        let key = itemArr[0];
        let val = itemArr[1];
        let validVal = typeof val === "string" && val;
        let validKey = typeof key === "string" && val;
        let active = false;
        if (validKey) {
            active = key.indexOf("#") === -1;
            active = key.indexOf(";") === -1;
            key = key.trim().toLowerCase();
        }
        if (validVal) val = val.trim();
        if (validKey && validVal && active) {
            if (key.indexOf("phone") !== -1) result.configs.Phone = val;
            else if (key.indexOf("username") !== -1)
                result.configs.Username = val;
            else if (key.indexOf("password") !== -1)
                result.configs.Password = val;
            else if (key.indexOf("apn") !== -1) result.configs.Init2 = val;
            else if (key.indexOf("refip1") !== -1)
                result.pingConfigs.REF_IP1 = val;
            else if (key.indexOf("refip2") !== -1)
                result.pingConfigs.REF_IP2 = val;
        }
    }
    return result;
}

function parseProviderConfig_r5(providerData) {
    const apnRegexp =
        /(?<="IP",")([^"]*)(?=")/;
    const numberRegexp = /(?<=ATD)(\*\d+#)/;

    const result = {
        apn: "",
        number: "",
    };

    const apnMatch = providerData.match(apnRegexp);
    if (apnMatch.length > 0) {
        result.apn = apnMatch[1];
    }
    const numberMatch = providerData.match(numberRegexp);
    if (numberMatch.length > 0) {
        result.number = numberMatch[1];
    }

    return result;
}

function parseUsers_r5(userData) {
    const rows = userData.split("\n");
    const users = [];

    for (row of rows) {
        if (row.slice(0, 1) === "#") continue;
        if (row.length < 1) continue;

        const userSettings = row.trim().split(/\s+/);
        const login = userSettings[0] == "\"\"" ? "" : userSettings[0];
        const password = userSettings[2] == "\"\"" ? "" : userSettings[2];
        //if (login === "n" && password === "n") continue;

        users.push({ login, password });
    }

    return users;
}

function parseInterfaceTesterConfig_r5(interfaceTesterData) {
    const ipModemRegexp =
        /(?<=test_ip_via_modem=)((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/;
    const ipEthernetRegexp =
        /(?<=test_ip_via_ethernet=)((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/;

    const result = {
        modemTestIp: "",
        ethernetTestIp: "",
    };

    const ipModemMatch = interfaceTesterData.match(ipModemRegexp);
    if (ipModemMatch.length > 0) {
        result.modemTestIp = ipModemMatch[1];
    }
    const ipEthernetMatch = interfaceTesterData.match(ipEthernetRegexp);
    if (ipEthernetMatch.length > 0) {
        result.ethernetTestIp = ipEthernetMatch[1];
    }

    return result;
}

function parse3GConfig_r5(
    interfaceTesterPath,
    usersPath1,
    usersPath2,
    providerPath1,
    providerPath2
) {
    const providerData1 = fs.readFileSync(providerPath1, "utf8");
    const providerData2 = fs.readFileSync(providerPath2, "utf8");

    const { apn: apn1, number: number1 } =
        parseProviderConfig_r5(providerData1);
    const { apn: apn2, number: number2 } =
        parseProviderConfig_r5(providerData2);

    const userData = fs.readFileSync(usersPath1, "utf8");
    const users = parseUsers_r5(userData);

    const interfaceTesterData = fs.readFileSync(interfaceTesterPath, "utf8");
    const { modemTestIp, ethernetTestIp } =
        parseInterfaceTesterConfig_r5(interfaceTesterData);

    return {
        config: {
            Init2: apn1,
            Phone: number1,
            Password: users[0] ? users[0].password : "",
            Username: users[0] ? users[0].login : "",
            Init22: apn2,
            Phone2: number2,
            Password2: users[1] ? users[1].password : "",
            Username2: users[1] ? users[1].login : "",
        },
        pingConfig: {
            REF_IP1: modemTestIp,
            REF_IP2: ethernetTestIp,
        },
    };
}

const readConfig = ({
    softwareRevision,
    PROD_INFO,
    wireless3GConfigs,
    logger,
}) => {
    /**
     * Read main configs
     */
    let configs = {
        Init2: "",
        Phone: "",
        Password: "",
        Username: "",
    };
    let pingConfigs = {};

    if (PROD_INFO.Board_revision === "05" || PROD_INFO.Board_revision === "06" || PROD_INFO.Board_revision === "07") {
        const {
            interfaceTesterFileDir,
            interfaceTesterFileName,
            usersFileDir,
            usersFileName1,
            usersFileName2,
            providerFileDir,
            providerFileName1,
            providerFileName2,
        } = wireless3GConfigs;

        const interfaceTesterPath =
            interfaceTesterFileDir + interfaceTesterFileName;
        const usersPath1 = usersFileDir + usersFileName1;
        const usersPath2 = usersFileDir + usersFileName2;
        const providerPath1 = providerFileDir + providerFileName1;
        const providerPath2 = providerFileDir + providerFileName2;

        logger.debug("Read main configs and configs for ping");

        const data = parse3GConfig_r5(
            interfaceTesterPath,
            usersPath1,
            usersPath2,
            providerPath1,
            providerPath2
        );

        configs = data.config;
        logger.silly(configs);
        pingConfigs = data.pingConfig;
        logger.silly(pingConfigs);

    } else {
        const {
            fileDir,
            fileName,
            interfaceManagerFileDir,
            interfaceManagerFileName,
        } = wireless3GConfigs;
        const filePath = fileDir + fileName;
        const interfaceManagerFilePath =
            interfaceManagerFileDir + interfaceManagerFileName;

        if (softwareRevision >= 2) {
            logger.debug("Read main configs and configs for ping");
            let data = parse3GConfig_r2(filePath);
            configs = data.configs;
            logger.silly(configs);
            pingConfigs = data.pingConfigs;
            logger.silly(pingConfigs);
        } else {
            logger.debug("Read main configs");
            configs = parse3GConfig_r1(filePath);
            logger.silly(configs);
            logger.debug("Read configs for ping");
            pingConfigs = parse3GPingConfig_r1(interfaceManagerFilePath);
            logger.silly(pingConfigs);
        }
    }

    return Object.assign({}, configs, pingConfigs);
};

exports.readConfig = readConfig;
