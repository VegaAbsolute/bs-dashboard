const fs = require('fs');
const networkConfValidator = require('../../utils/validators/network-configs-validator.js').networkConfValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const writeConfig = ({SETTINGS, data: configs, logger}) => {
    logger.silly('writeConfig');
    const fileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.fileName;
    const dnsFileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.DnsFileName;

    const newConfigsMask = {
        eth0: null,
        address: null,
        netmask: null,
        gateway: null
    };
    const dnsConfigsMask = {
        domain: null,
        nameserver0: null,
        nameserver1: null
    };

    const newConfigs = parseObjectByMask(configs, newConfigsMask, false);
    const dnsConfigs = parseObjectByMask(configs, dnsConfigsMask, false);

    logger.silly(newConfigs);
    const isMainValid = networkConfValidator({data: newConfigs, logger});
    logger.silly(dnsConfigs);
    const isDnsValid = networkConfValidator({data: dnsConfigs, logger});
    const isValid = (isMainValid.isValid && isDnsValid.isValid);

    logger.info('Is valid new configs for write to "interfaces" = ' + (isValid));
    // merge configs and write to file
    if (isValid) {
        /**
         * Write main configs
         */
        const networkConfigsArray = fs.readFileSync(fileAddress, 'utf8').toString().split("\n");

        let beginNetworkConfigsBlock = -1;
        let endNetworkConfigsBlock = -1;
        for(var i in networkConfigsArray) {
            const isNotCommented = (networkConfigsArray[i].indexOf('#') === -1);

            // definition network configs block of 'eth0'
            if (isNotCommented) {
                if (networkConfigsArray[i].indexOf('iface') !== -1) {
                    let deviceConfArray = networkConfigsArray[i].trim().split(" ");
                    if (deviceConfArray[1] === 'eth0') {
                        beginNetworkConfigsBlock = i;
                    } else {
                        if (endNetworkConfigsBlock === -1 && beginNetworkConfigsBlock !== -1) {
                            endNetworkConfigsBlock = i - 1;
                            break;
                        }
                    }
                }
            }
        }
        //console.log(beginNetworkConfigsBlock, endNetworkConfigsBlock);

        //prepare new configs array for insert
        let newConfigsArray = [`iface eth0 inet ${newConfigs['eth0']}` ];
        for (var key in newConfigs) {
            if (key !== 'eth0') {
                const commented = newConfigs['eth0'] === 'dhcp' ? '#' : '';
                newConfigsArray = [...newConfigsArray, `  ${commented}${key} ${newConfigs[key]}`];
            }
        }
        // TODO:
        newConfigsArray = [
            ...newConfigsArray,
            "  #don't remove this udhcpc_opts!",
            '  udhcpc_opts -s /etc/network/kill_udhcpc_at_startup',
            '  pre-up /bin/grep -v -e "ip=[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+" /proc/cmdline $line > /dev/null'
        ];

        //insert newConfigsArray into cconfigs
        const resultConfigsArray = [
            ...networkConfigsArray.slice(0, beginNetworkConfigsBlock),
            ...newConfigsArray,
            '',
            ...networkConfigsArray.slice(endNetworkConfigsBlock + 1)
        ]

        //console.log('resultConfigsArray.length =',resultConfigsArray.length);

        let resultConfigs = '';
        for (var i in resultConfigsArray) {
            const nextStr = (i < resultConfigsArray.length - 1) ? '\n' : '';
            resultConfigs += resultConfigsArray[i] + nextStr;
        }

        fs.writeFileSync(fileAddress, resultConfigs);

        /**
         * Write DNS configs
         */
        let dnsConfString = `domain ${dnsConfigs.domain}\n`;
        dnsConfString += `nameserver ${dnsConfigs.nameserver0}\n`;
        dnsConfString += `nameserver ${dnsConfigs.nameserver1}\n`;

        fs.writeFileSync(dnsFileAddress, dnsConfString);
    }

    return {isValid: isValid, msg: [...isMainValid.msg, ...isDnsValid.msg]};
}

exports.writeConfig = writeConfig;
