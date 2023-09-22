const fs = require('fs');

function cidrToMask(countBit) 
{
    var mask = [];
    for ( var i = 0; i < 4; i++ ) 
    {
      var n = Math.min(countBit, 8);
      mask.push( 256 - Math.pow( 2, 8-n ) );
      countBit -= n;
    }
    return mask.join('.');
 }
function parseIni(str)
{
    var regEx = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    var obj = {};
    var lines = str.split(/[\r\n]+/);
    var section = null;
    
    for (var key in lines)
    {
        var line = lines[key];
        if ( regEx.comment.test(line) ) continue;
        else if ( regEx.param.test(line) ) 
        {
            var strParam = line.match(regEx.param);
            if ( section )
            {
                obj[section][strParam[1]] = strParam[2];
            }
            else
            {
                obj[strParam[1]] = strParam[2];
            }
        }
        else if ( regEx.section.test(line) )
        {
            var sectionStr = line.match(regEx.section);
            obj[sectionStr[1]] = {};
            section = sectionStr[1];
        }
        else if ( line.length == 0 && section )
        {
            section = null;
        };
    }
    return obj;
}

function parseDnsConfig_r1 (strFileConfig)
{
    let result = {};
    let validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        let arrDnsConfigs = strFileConfig.split("\n");
        let dnsIndex = 0;
        for (let row of arrDnsConfigs) {
            const indexOfSeparator = row.indexOf(' ');
            if (indexOfSeparator > 0) {
                const key = row.substring(0, indexOfSeparator).trim();
                const val = row.substring(indexOfSeparator + 1).trim();
                if (key === 'domain') {
                    result = Object.assign(
                        result,
                        { domain: val }
                    );
                } else if (key === 'nameserver') {
                    result = Object.assign(
                        result,
                        { [key + dnsIndex]: val }
                    );
                    dnsIndex += 1;
                }
            };
        };
    }
    return result;
}
function parseDnsConfig_r2 (strFileConfig)
{
    let result = {};
    let validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        let arrDnsConfigs = strFileConfig.split("\n");
        let dnsIndex = 0;
        for (let row of arrDnsConfigs) {
            const indexOfSeparator = row.indexOf(' ');
            if (indexOfSeparator > 0) {
                const key = row.substring(0, indexOfSeparator).trim();
                const val = row.substring(indexOfSeparator + 1).trim();
                if (key === 'search') {
                    result = Object.assign(
                        result,
                        { domain: val }
                    );
                } else if (key === 'nameserver') {
                    result = Object.assign(
                        result,
                        { [key + dnsIndex]: val }
                    );
                    dnsIndex += 1;
                }
            };
        };
    }
    return result;
}
function parseDnsConfig_r3 (strFileConfig)
{
    // let result = {
    //     domain: 'vega-absolute.ru',
    //     nameserver0: '193.238.131.93',
    //     nameserver1: '193.238.131.65'
    // };
    let result = {
        domain: '',
        nameserver0: '',
        nameserver1: ''
    };
    var validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        var config = parseIni(strFileConfig);
        let dnsIndex = 0;
        if ( typeof config['Network'] === 'object' )
        {
            for ( var key in config['Network'] )
            {
                var val = config['Network'][key];
                if ( typeof key === 'string' && key.indexOf('Domains') !== -1 )
                {
                    result.domain = val;
                } 
                else if ( typeof key === 'string' && key.indexOf('DNS') !== -1 )
                {
                    val = val.split( ' ' );
                    for( var i in val )
                    {
                        var nameserver = val[i];
                        if(nameserver) 
                        {
                            result['nameserver'+dnsIndex] = nameserver;
                            dnsIndex += 1;
                        }
                    }
                } 
            }
        }
    }
    return result;
}
function parseNetworkConfig_r1 (strFileConfig)
{
    let result = {
        eth0: "",
        address: "",
        netmask: "",
        gateway: ""
    };
    var validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        let arrNetworkConfigs = strFileConfig.split("\n");
        let isNetworkConfigs = false;
    for(var i in arrNetworkConfigs) {
        const isNotCommented = (arrNetworkConfigs[i].indexOf('#') === -1);
        // definition network configs block of 'eth0'
            if (isNotCommented) {
                if (arrNetworkConfigs[i].indexOf('iface') !== -1) {
                    let deviceConfArray = arrNetworkConfigs[i].trim().split(" ");
                    if (deviceConfArray[1] === 'eth0') {
                        isNetworkConfigs = true;
                        result['eth0'] = deviceConfArray[3];
                    } else {
                        isNetworkConfigs = false;
                    }
                }
            }
            // insert found configs into 'networkConfigs' object
            if (isNetworkConfigs) {
                let oneConfigArray = arrNetworkConfigs[i].trim().split(" ");
                oneConfigArray[0] = isNotCommented ? oneConfigArray[0] : oneConfigArray[0].substring(1);//remove '#'
                for (var key in result) {
                    if (key !== 'eth0') {
                        if (key === oneConfigArray[0]) {
                            result[key] = oneConfigArray[1];
                        }
                    }
                }
            }
        };
    }

    return result;
}
function parseNetworkConfig_r2 (strFileConfig,fullMode)
{
    let result = {
        eth0: "static",
        address: "192.168.10.2",
        netmask: "255.255.255.0",
        gateway: "192.168.10.1"
    };
    var validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        let arrNetworkConfigs = strFileConfig.split("\n");
        for (let row of arrNetworkConfigs) 
        {
            let itemArr = row.trim().split('=');
            let key = itemArr[0];
            let val = itemArr[1];
            let validVal = typeof val === 'string' && val;
            let validKey = typeof key === 'string' && val;
            let active = false;
            if ( validKey ) 
            {
                active = key.indexOf('#') === -1;
                key = key.trim().toLowerCase();
            }
            if ( validVal ) val = val.trim().toLowerCase();
            
            if ( validKey && validVal )
            {
                if( key.indexOf('dhcp') !== -1 )
                {
                    if ( active && val == 'yes' )
                    {
                        result.eth0 = 'dhcp';
                    }
                    else
                    {
                        result.eth0 = 'static';
                    }
                }
                else if ( key.indexOf('ipaddress') !== -1 )
                {
                   // if ( active ) result.address = val;
                    result.address = val;
                }
                else if ( key.indexOf('netmask') !== -1 )
                {
                   // if ( active ) result.netmask = val;
                    result.netmask = val;
                }
                else if ( key.indexOf('gateway') !== -1 )
                {
                   // if ( active ) result.gateway = val;
                    result.gateway = val;
                }
                else if ( key.indexOf('interface') !== -1 && val === 'eth0' ) continue;
                else if( active && fullMode ) 
                {
                   result[key] = val;
                }
            }
        }
    }
    return result;
}

function parseNetworkConfig_r3 (strFileConfig,fullMode)
{
    let result = {
        eth0: "static",
        address: "",
        netmask: "",
        gateway: ""
    };
    var validStrFileConfig = typeof strFileConfig === 'string';
    if(validStrFileConfig)
    {
        var config = parseIni(strFileConfig);
        if ( typeof config['Network'] === 'object' )
        {
            if ( config['Network']['DHCP'] == 'yes' ) result.eth0 = 'dhcp';
            else result.eth0 = 'static';

            for ( var key in config['Network'] )
            {
                var val = config['Network'][key];
                if ( typeof key === 'string' && key.indexOf('Address') !== -1 )
                {
                    val = val.split('/');
                    var ip = val[0];
                    var cidr = val[1];
                    var mask = cidrToMask(cidr);
                    result.address = ip;
                    result.netmask = mask;
                } 
                else if ( typeof key === 'string' && key.indexOf('Gateway') !== -1 )
                {
                    result.gateway = val;
                } 
            }
        }
    }
    return result;
}

const readConfig = ({SETTINGS, PROD_INFO, logger}) => {
    logger.silly('readConfig');

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

    /**
     *  Read main configs
     */
    logger.silly('Read main configs');
    const mainConfigsFileAddress = SETTINGS.networkConfigs.fileDir + SETTINGS.networkConfigs.fileName;
    //const networkConfigsArray = fs.readFileSync(mainConfigsFileAddress, 'utf8').toString().split("\n");
    const networkConfigsFile = fs.readFileSync(mainConfigsFileAddress, 'utf8').toString();

    let networkConfigs = {
        eth0: "",
        address: "",
        netmask: "",
        gateway: ""
    };
    
    if ( boardRevision >= 5 ) networkConfigs = parseNetworkConfig_r3( networkConfigsFile );
    else if ( softwareRevision >= 2 ) networkConfigs = parseNetworkConfig_r2( networkConfigsFile );
    else networkConfigs = parseNetworkConfig_r1( networkConfigsFile );


    //console.log(networkConfigs);

    logger.silly(networkConfigs);

    /**
     * Read DNS configs
     */
    logger.silly('Read DNS configs');
    
    let dnsFileDir = SETTINGS.networkConfigs.fileDir;
    let dnsFileName = SETTINGS.networkConfigs.DnsFileName;
    if ( boardRevision >= 5 ) dnsFileName =  SETTINGS.networkConfigs.fileName;

    let validSettingsNetworkConfigs = typeof SETTINGS.networkConfigs === 'object' && SETTINGS.networkConfigs !== null;
    let validSettingDnsFileDir = validSettingsNetworkConfigs && typeof SETTINGS.networkConfigs.DnsFileDir === 'string' && SETTINGS.networkConfigs.DnsFileDir;
    if( validSettingDnsFileDir ) dnsFileDir = SETTINGS.networkConfigs.DnsFileDir;

    const dnsConfigsFileAddress = dnsFileDir + dnsFileName;
     
    //const dnsConfigsArray = fs.readFileSync(dnsConfigsFileAddress, 'utf8').toString().split("\n");
    const dnsConfigsFile = fs.readFileSync(dnsConfigsFileAddress, 'utf8').toString();

    let dnsConfigs = {};
    
    if ( boardRevision >= 5 ) dnsConfigs = parseDnsConfig_r3( networkConfigsFile );
    else if ( softwareRevision >= 2 ) dnsConfigs = parseDnsConfig_r2(dnsConfigsFile);
    else dnsConfigs = parseDnsConfig_r1(dnsConfigsFile);
    
    
    logger.silly(dnsConfigs);

	return Object.assign({}, networkConfigs, dnsConfigs);
}

exports.readConfig = readConfig;
exports.parseNetworkConfig_r2 = parseNetworkConfig_r2;
exports.parseIni = parseIni;