const fs = require('fs');
const networkConfValidator = require('../utils/network-configs-validator.js').networkConfValidator;

const writeConfig = ({filePath: fileAddress, data: configs, logger}) => {
    const {
            eth0 = '',
            address = "",
            netmask = "",
            gateway = ""
        } = configs;
    const newConfigs = {
            eth0,
            address,
            netmask,
            gateway
        }

    const isValid = networkConfValidator({data: newConfigs, logger});

    logger.info('Is valid new configs for write to "interfaces" = ' + isValid);
    // merge configs and write to file
    if (isValid) {
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
        //const eth0 = newConfigs['eth0'];
        let newConfigsArray = [`iface eth0 inet ${eth0}` ];
        for (var key in newConfigs) {
            if (key !== 'eth0') {
                const commented = eth0 === 'dhcp' ? '#' : '';
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
    }

    return isValid;
}

exports.writeConfig = writeConfig;
