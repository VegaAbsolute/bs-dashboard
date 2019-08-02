const fs = require('fs');
const removeComentsFromLoraGlobalConf = require('../../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;
const parseObjectByMask = require('../../utils/parse-object-by-mask.js').parseObjectByMask;

const readConfig = ({filePath, logger}) => {
	logger.silly('readConfig');
	const text = fs.readFileSync(filePath, 'utf8');
	const clearedText = removeComentsFromLoraGlobalConf(text, '/*', '*/')
	const object = JSON.parse(clearedText);

	const dataMask = {
		gateway_conf:{
	        gateway_ID: null,
	        server_address: null,
	        serv_port_up: null,
	        serv_port_down: null
		}
    };

	const sendConfigs = parseObjectByMask(object, dataMask, false);
	logger.silly(sendConfigs);
	return sendConfigs;
}

exports.readConfig = readConfig;
