const fs = require("fs");
const getGlobalProdInfo = require("../../read-prod-info-file.js").getGlobalProdInfo;
const renameProperty = require("../rename-property.js");

const mergeDeep = require("../../utils/merge-deep.js").mergeDeep;
const parseObjectByMask = require("../../utils/parse-object-by-mask.js").parseObjectByMask;

const readConfig = require("./read-config.js").readConfig;

const writeConfig = ({ SETTINGS, data, dataMask = null, logger, validator }) => {
    logger.silly("lora-configs-file-actions/writeConfig");
    const globalConfigFilePath =
        SETTINGS.loraGlobalConfigs.filePath + SETTINGS.loraGlobalConfigs.fileName;
    const localConfigFilePath = SETTINGS.loraGlobalConfigs.filePath + "local_conf.json";

    // get configs from files
    const previousConfigs = readConfig({ SETTINGS, logger });

    // prepare new configs
    let newConfigs = {};
    if (dataMask === null) {
        newConfigs = data;
    } else {
        newConfigs = parseObjectByMask(data, dataMask, false);
    }

    logger.silly(newConfigs);

    // Validate new configs
    const validationResult = validator({ data: newConfigs, logger });
    /*
    {
        isValid: validateResult,
        msg: [...addChnValidationResult.msg, ...frequencyValidationResult.descriptionOfNotValid]
    }
    */
    logger.info(
        'Is valid new configs for write to "global_conf.json" = ' + validationResult.isValid
    );

    // merge configs and write to file
    if (validationResult.isValid) {
        const resultConfigs = mergeDeep(previousConfigs, newConfigs);

        if (getGlobalProdInfo().Board_revision == "03" || getGlobalProdInfo().Board_revision == "04") {
            renameProperty(resultConfigs, "SX1301_conf", "SX130x_conf");
            renameProperty(resultConfigs, "gateway_conf", "acab");
            renameProperty(resultConfigs, "acab", "gateway_conf");
            renameProperty(resultConfigs, "debug_conf", "acab");
            renameProperty(resultConfigs, "acab", "debug_conf");
        }
		
        const stringResultConfigs = JSON.stringify(resultConfigs, null, "\t");
        fs.writeFileSync(globalConfigFilePath, stringResultConfigs);

        // Remove local_conf.json
        try {
            fs.unlinkSync(localConfigFilePath);
            logger.debug("local conf file was deleted");
        } catch (e) {
            logger.debug("local conf file is do not exists");
        }
    }

    return validationResult;
};

exports.writeConfig = writeConfig;
