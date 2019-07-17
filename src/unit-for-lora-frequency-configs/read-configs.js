const fs = require('fs');
const removeComentsFromLoraGlobalConf = require('../utils/rm-cmnts-from-lora-globalconf.js').removeComentsFromLoraGlobalConf;

const mergeDeep = (objR, objS) => {
  const isObject = (obj) => {
	  return obj && typeof obj === 'object';
  }

  Object.keys(objR).forEach((key) => {
      const objRVal = objR[key];
      const objSVal = objS[key];

      if (Array.isArray(objRVal) && Array.isArray(objSVal)) {
        //prev[key] = prevVal.concat(...objVal);
      }
      else if (isObject(objRVal) && isObject(objSVal)) {
        objR[key] = mergeDeep(objRVal, objSVal);
      }
      else {
        objR[key] = objSVal;
      }
    });

    return objR;
}

const readConfig = ({filePath, logger}) => {
	const configsText = fs.readFileSync(filePath, 'utf8');
    const clearedText = removeComentsFromLoraGlobalConf(configsText, '/*', '*/')
	const configsObject = JSON.parse(clearedText);

    const configsMask = {
        SX1301_conf: {
            radio_0: {
                freq: null
            },
            radio_1: {
                freq: null
            },
            chan_multiSF_0: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_1: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_2: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_3: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_4: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_5: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_6: {
                enable: null,
                radio: null,
                if: null
            },
            chan_multiSF_7: {
                enable: null,
                radio: null,
                if: null
            }
        }
    }

	const sendConfigs = mergeDeep(configsMask, configsObject)
    // TODO: delete console.log();
    //console.log(sendConfigs);
	return sendConfigs;
}

exports.readConfig = readConfig;
