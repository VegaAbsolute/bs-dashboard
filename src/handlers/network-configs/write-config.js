const fs = require('fs');
const networkConfValidator = require('../../utils/validators/network-configs-validator.js').networkConfValidator;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;
const parseNetworkConfig_r2 = require('../../handlers/network-configs/read-config.js').parseNetworkConfig_r2;
const parseIni = require('../../handlers/network-configs/read-config.js').parseIni;

function maskToCidr(mask)
{
    var maskNodes = mask.match(/(\d+)/g);
    var cidr = 0;
    for(var i in maskNodes)
    {
        cidr += ( ((maskNodes[i] >>> 0).toString(2)).match(/1/g) || [] ).length;
    }
    return cidr; 
}
function writeNetworkConfig_r1 ( newConfigs, fileAddress )
{
    const strFileConfig = fs.readFileSync(fileAddress, 'utf8').toString();
    let validStrFileConfig = typeof strFileConfig === 'string';
    let validNewConfig = typeof newConfigs === 'object';
    if (!validStrFileConfig || !validNewConfig) return false;
    let networkConfigsArray = strFileConfig.split("\n");
    let beginNetworkConfigsBlock = -1;
    let endNetworkConfigsBlock = -1;
    for (var i in networkConfigsArray) {
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
    //prepare new configs array for insert
    let newConfigsArray = [`iface eth0 inet ${newConfigs['eth0']}`];
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

    let resultConfigs = '';
    for (var i in resultConfigsArray) {
        const nextStr = (i < resultConfigsArray.length - 1) ? '\n' : '';
        resultConfigs += resultConfigsArray[i] + nextStr;
    }

    fs.writeFileSync(fileAddress, resultConfigs);
    return true;
}
function writeNetworkConfig_r2 (newConfigs, fileAddress)
{
    const strFileConfig = fs.readFileSync(fileAddress, 'utf8').toString();
    let validStrFileConfig = typeof strFileConfig === 'string';
    let validNewConfig = typeof newConfigs === 'object';
    if (!validStrFileConfig || !validNewConfig) return false;
    let oldConfig = parseNetworkConfig_r2(strFileConfig,'full');
    for (let key in oldConfig) 
    {
        let item = oldConfig[key];
        if( newConfigs[key] === undefined ) newConfigs[key] = item;
    }

    let strForSave = 'INTERFACE=eth0\n';
    let comment = newConfigs['eth0'] === 'dhcp' ? '#' : '';
    for (let key in newConfigs) 
    {
        let val = newConfigs[key];
        let upKey = key.toUpperCase();
        if ( key == 'eth0' && val == 'dhcp' ) strForSave+=`DHCP=yes\n`;
        else if ( key == 'eth0' && val == 'static' ) strForSave+=``;
        else if ( key == 'eth0' ) strForSave+=``;
        else if ( key == 'address' ) strForSave+=`${comment}IPADDRESS=${val}\n`;
        else if ( key == 'netmask' ) strForSave+=`${comment}NETMASK=${val}\n`;
        else if ( key == 'gateway' ) strForSave+=`${comment}GATEWAY=${val}\n`;
        else strForSave+=`${upKey}=${val}\n`;
    }
    fs.writeFileSync(fileAddress, strForSave);
    return true;
}
function writeNetworkConfig_r3 (newConfigs, fileAddress, newConfigsDns)
{
    //Address address/netmask
    //DHCP eth0
    //Gateway gateway
    //DNS nameserver0 nameserver1
    //Domains domain
    let isDhcp = false;

    const strFileConfig = fs.readFileSync(fileAddress, 'utf8').toString();

    // console.log('newConfigs',newConfigs);
    // console.log('newConfigsDns',newConfigsDns);
    // console.log('strFileConfig',strFileConfig);
    // console.log('writeNetworkConfig_r3',writeNetworkConfig_r3);
    // console.log('parseIni',parseIni);

    let validStrFileConfig = typeof strFileConfig === 'string';
    let validNewConfig = typeof newConfigs === 'object';
    let validNewConfigsDns = typeof newConfigsDns === 'object';
    if (!validStrFileConfig || !validNewConfig || !validNewConfigsDns) return false;
    let config = parseIni(strFileConfig);
   // console.log('Было config',config);
    if ( typeof config !== 'object' ) config = {};
    if ( typeof config['Network'] !== 'object' ) config['Network'] = {};

    if ( newConfigs.eth0 === 'dhcp' ) 
    {
        isDhcp = true;
        config['Network']['DHCP'] = 'yes';
        for (let key in config['Network']) 
        {
            if ( typeof key === 'string' && key.indexOf('DHCP') !== -1 ) continue;

            if ( key.indexOf('#') === -1 ) 
            {
                config['Network'][`#${key}`] = config['Network'][key];
                delete config['Network'][key];
            }
        }
    }
    else  
    {
        if ( config['Network']['DHCP'] ) config['Network']['#DHCP'] = config['Network']['DHCP'];
        delete config['Network']['DHCP'];
    }
    if ( newConfigs.netmask && newConfigs.address)
    {
        var cidr = maskToCidr(newConfigs.netmask);
        var addr = `${newConfigs.address}/${cidr}`;
        config['Network']['Address'] = addr;
    }
    if ( newConfigs.gateway ) config['Network']['Gateway'] = newConfigs.gateway;
    
    var DNS = ''; 
    if ( newConfigsDns.nameserver0 ) DNS += `${newConfigsDns.nameserver0} `;
    if ( newConfigsDns.nameserver1 ) DNS += `${newConfigsDns.nameserver1} `;
    if ( DNS ) config['Network']['DNS'] = DNS;
    if ( newConfigsDns.domain ) config['Network']['Domains'] = newConfigsDns.domain;
  
    //console.log('Между config',config);

    if ( isDhcp ) 
    {
        for (let key in config['Network']) 
        {
            if ( typeof key === 'string' && key.indexOf('DHCP') !== -1 ) continue;

            if ( key.indexOf('#') === -1 ) 
            {
                config['Network'][`#${key}`] = config['Network'][key];
                delete config['Network'][key];
            }
        }
    }
    else 
    {
        for (let key in config['Network']) 
        {
            if ( typeof key === 'string' && key.indexOf('#DHCP') !== -1 ) continue;

            if ( key.indexOf('#') !== -1 ) 
            {
                delete config['Network'][key];
            }
        }
    }
    //console.log('Стало config',config);
    let strForSave = '';
    for ( let sectionName in config ) 
    {
        let section = config[sectionName];
        if ( typeof section !== 'object' ) continue;
        strForSave += `[${sectionName.trim()}]\n`;
        for ( let paramName in section )
        {
            let paramValue = section[paramName];
            if ( typeof paramName !== 'string' && typeof paramValue !== 'string' ) continue;
            strForSave += `${paramName.trim()}=${paramValue.trim()}\n`;
        }
    }
    //console.log(fileAddress,strForSave);
    fs.writeFileSync(fileAddress, strForSave);
    const exec = require('child_process').exec;
    exec('systemctl restart systemd-networkd', () => {
        console.log('Restart systemd-networkd.');
    });
    return true;
}

const writeConfig = ({ SETTINGS, PROD_INFO, data: configs, logger }) => {
    logger.silly('writeConfig');
    const fileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.fileName;
    
    let dnsFileDir = SETTINGS.networkConfigs.fileDir;
    let dnsFileName = SETTINGS.networkConfigs.fileName;
    let validSettingsNetworkConfigs = typeof SETTINGS.networkConfigs === 'object' && SETTINGS.networkConfigs !== null;
    let validSettingDnsFileDir = validSettingsNetworkConfigs && typeof SETTINGS.networkConfigs.DnsFileDir === 'string' && SETTINGS.networkConfigs.DnsFileDir;
    if( validSettingDnsFileDir ) dnsFileDir = SETTINGS.networkConfigs.DnsFileDir;
    let validSettingDnsFileName = validSettingsNetworkConfigs && typeof SETTINGS.networkConfigs.DnsFileName === 'string' && SETTINGS.networkConfigs.DnsFileName;
    if( validSettingDnsFileName ) dnsFileName = SETTINGS.networkConfigs.DnsFileName;

    let softwareRevision = 1;
    let boardRevision = 1;
    let tempSoftwareRevision = NaN;
    let tempBoardRevision = NaN;

    let validPROD_INFO = typeof PROD_INFO === 'object' && PROD_INFO !== null;

    let validSoftwareRevision = validPROD_INFO && PROD_INFO.Software_revision;
    let validBoardRevision = validPROD_INFO && PROD_INFO.Board_revision;
    if(validSoftwareRevision) tempSoftwareRevision = parseInt(PROD_INFO.Software_revision);
    if(validBoardRevision) tempBoardRevision = parseInt(PROD_INFO.Board_revision);
    if(!isNaN(tempSoftwareRevision)) softwareRevision = tempSoftwareRevision;
    if(!isNaN(tempBoardRevision)) boardRevision = tempBoardRevision;

    const dnsFileAddress = dnsFileDir + SETTINGS.networkConfigs.DnsFileName;
    
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
    const isMainValid = networkConfValidator({ data: newConfigs, logger });
    logger.silly(dnsConfigs);
    const isDnsValid = networkConfValidator({ data: dnsConfigs, logger });
    const isValid = (isMainValid.isValid && isDnsValid.isValid);

    logger.info('Is valid new configs for write to "interfaces" = ' + (isValid));
    // merge configs and write to file
    if (isValid) {
        /**
         * Write main configs
         */
        
        //const networkConfigsArray = fs.readFileSync(fileAddress, 'utf8').toString().split("\n");
        if ( boardRevision >= 5 )  writeNetworkConfig_r3 (newConfigs, fileAddress, dnsConfigs);
        else if ( softwareRevision == 2 )  writeNetworkConfig_r2 (newConfigs, fileAddress);
        else writeNetworkConfig_r1(newConfigs, fileAddress);

        /**
         * Write DNS configs
         */
        const hasDomain = dnsConfigs.domain ? String(dnsConfigs.domain).length > 0 : false;
        const hasNameserver0 = dnsConfigs.nameserver0 ? String(dnsConfigs.nameserver0).length > 0 : false;
        const hasNameserver1 = dnsConfigs.nameserver1 ? String(dnsConfigs.nameserver1).length > 0 : false;
        
        let rowDomain = '';
        if ( boardRevision >= 5 )
        {
            
        }
        else 
        {
            if(softwareRevision === 1)
            {
                rowDomain = hasDomain ? `domain ${dnsConfigs.domain}\n` : '';
            }
            else if ( softwareRevision >= 2 )
            {
                rowDomain = hasDomain ? `search ${dnsConfigs.domain}\n` : '';
            }
            let dnsConfString = rowDomain;
            dnsConfString += hasNameserver0 ? `nameserver ${dnsConfigs.nameserver0}\n` : '';
            dnsConfString += hasNameserver1 > 0 ? `nameserver ${dnsConfigs.nameserver1}\n` : '';

            fs.writeFileSync(dnsFileAddress, dnsConfString);
        }
    }

    return { isValid: isValid, msg: [...isMainValid.msg, ...isDnsValid.msg] };
}

exports.writeConfig = writeConfig;
