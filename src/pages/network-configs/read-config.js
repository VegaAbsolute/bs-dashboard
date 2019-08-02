const fs = require('fs');

const readConfig = ({SETTINGS, logger}) => {
    logger.silly('readConfig');

    /**
     *  Read main configs
     */
    logger.silly('Read main configs');
    const mainConfigsFileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.fileName;
    const networkConfigsArray = fs.readFileSync(mainConfigsFileAddress, 'utf8').toString().split("\n");
    let networkConfigs = {
        eth0: "",
        address: "",
        netmask: "",
        gateway: ""
    };

    let isNetworkConfigs = false;
    for(var i in networkConfigsArray) {
        const isNotCommented = (networkConfigsArray[i].indexOf('#') === -1);

        // definition network configs block of 'eth0'
        if (isNotCommented) {
            if (networkConfigsArray[i].indexOf('iface') !== -1) {
                let deviceConfArray = networkConfigsArray[i].trim().split(" ");
                if (deviceConfArray[1] === 'eth0') {
                    isNetworkConfigs = true;
                    networkConfigs['eth0'] = deviceConfArray[3];
                } else {
                    isNetworkConfigs = false;
                }
            }
        }

        // insert found configs into 'networkConfigs' object
        if (isNetworkConfigs) {
            let oneConfigArray = networkConfigsArray[i].trim().split(" ");
            oneConfigArray[0] = isNotCommented ? oneConfigArray[0] : oneConfigArray[0].substring(1);//remove '#'
            for (var key in networkConfigs) {
                if (key !== 'eth0') {
                    if (key === oneConfigArray[0]) {
                        networkConfigs[key] = oneConfigArray[1];
                    }
                }
            }
        }
    };
    logger.silly(networkConfigs);

    /**
     * Read DNS configs
     */
    logger.silly('Read DNS configs');
    const dnsConfigsFileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.DnsFileName;
    const dnsConfigsArray = fs.readFileSync(dnsConfigsFileAddress, 'utf8').toString().split("\n");

    let dnsConfigs = {};
    let dnsIndex = 0;
    for (let row of dnsConfigsArray) {
        const indexOfSeparator = row.indexOf(' ');
        if (indexOfSeparator > 0) {
            const key = row.substring(0, indexOfSeparator).trim();
            const val = row.substring(indexOfSeparator + 1).trim();
            if (key === 'domain') {
                dnsConfigs = Object.assign(
                    dnsConfigs,
                    { domain: val }
                );
            } else if (key === 'nameserver') {
                dnsConfigs = Object.assign(
                    dnsConfigs,
                    { [key + dnsIndex]: val }
                );
                dnsIndex += 1;
            }
        };
    };
    logger.silly(dnsConfigs);

	return Object.assign({}, networkConfigs, dnsConfigs);
}

exports.readConfig = readConfig;
