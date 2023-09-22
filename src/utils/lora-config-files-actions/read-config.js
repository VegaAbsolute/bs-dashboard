const fs = require("fs");
const getGlobalProdInfo = require("../../read-prod-info-file.js").getGlobalProdInfo;
const renameProperty = require("../rename-property.js");
const removeComentsFromLoraGlobalConf =
    require("../rm-cmnts-from-lora-globalconf.js").removeComentsFromLoraGlobalConf;
const parseObjectByMask = require("../parse-object-by-mask.js").parseObjectByMask;

const readConfig = ({ SETTINGS, dataMask = null, logger }) => {
    logger.debug("lora-configs-file-actions/readConfig");
    const globalConfigFilePath =
        SETTINGS.loraGlobalConfigs.filePath + SETTINGS.loraGlobalConfigs.fileName;
    const localConfigFilePath = SETTINGS.loraGlobalConfigs.filePath + "local_conf.json";

    //read files
    let localConf = {};
    try {
        const localConfText = fs.readFileSync(localConfigFilePath, "utf8");
        const localConfClearedText = removeComentsFromLoraGlobalConf(localConfText, "/*", "*/");
        localConf = JSON.parse(localConfClearedText);
        logger.debug("local conf file is exists");
    } catch (e) {
        localConf = {};
        logger.debug("local conf file is do not exists");
    }
    
    const globalConfText = fs.readFileSync(globalConfigFilePath, "utf8");
    const globalConfClearedText = removeComentsFromLoraGlobalConf(globalConfText, "/*", "*/");
    const globalConf = JSON.parse(globalConfClearedText);

    if(globalConf.hasOwnProperty("SX130x_conf")){
        renameProperty(globalConf, "SX130x_conf", "SX1301_conf");
    }

    // if (getGlobalProdInfo().Board_revision == "03" || getGlobalProdInfo().Board_revision == "04" || getGlobalProdInfo().Board_revision == "05") {
    //     renameProperty(globalConf, "SX130x_conf", "SX1301_conf");
    // }

    // Merge local conf into global conf only fields which is existed in global conf
    let mergedConfigs = null;
    // Если BoardRevision 03, 04 или 05 парсим не по маске, а возвращаем исходное преобразованное значение
    // Так сделано потому, что весь исходный код рассчитан на то что в global_conf будет поле SX1301_conf
    // Но в новой ревизии packet_forwarder это поле переименовано в SX130x_conf, следовательно логика ломается
    if (getGlobalProdInfo().Board_revision == "03" || getGlobalProdInfo().Board_revision == "04" || getGlobalProdInfo().Board_revision == "05" || getGlobalProdInfo().Board_revision == "07") {
        mergedConfigs = globalConf;
    } else {
        mergedConfigs = parseObjectByMask(localConf, globalConf);
    }

    // Fetch data by mask
    let resultConfigs = {};
    if (dataMask !== null) {
        resultConfigs = parseObjectByMask(mergedConfigs, dataMask, false);
    } else {
        resultConfigs = mergedConfigs;
    }

    logger.silly(resultConfigs);

    return resultConfigs;
};

exports.readConfig = readConfig;
