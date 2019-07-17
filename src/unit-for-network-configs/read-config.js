const fs = require('fs');

const readConfig = ({filePath: address}) => {
    const networkConfigsArray = fs.readFileSync(address, 'utf8').toString().split("\n");
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
    }
	return networkConfigs;
}

exports.readConfig = readConfig;
