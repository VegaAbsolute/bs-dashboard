const fs = require('fs');
const removeComentsFromLoraGlobalConf = require('../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;

const readConfig = ({filePath}) => {
	const text = fs.readFileSync(filePath, 'utf8');
	const clearedText = removeComentsFromLoraGlobalConf(text, '/*', '*/')
	const object = JSON.parse(clearedText);

	const {
		gateway_ID,
		server_address,
		serv_port_up,
		serv_port_down
	} = object.gateway_conf;

	const sendConfigs = {
		gateway_conf: {
			gateway_ID,
			server_address,
        	serv_port_up,
        	serv_port_down
		}
	}
	return sendConfigs;
}

exports.readConfig = readConfig;
