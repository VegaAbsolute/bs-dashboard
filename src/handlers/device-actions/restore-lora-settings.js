const compose = require('../../utils/compose.js').compose;
const restoreSettingsAction = require('./restore-settings-action.js').restoreSettingsAction;
const getGlobalProdInfo = require("../../read-prod-info-file").getGlobalProdInfo;

const restoreLoraSettings = (SETTINGS, backupDir, logger, next) => {
    let localConfFunc = restoreSettingsAction(
        backupDir,
        SETTINGS.loraGlobalConfigs.filePath,
        "local_conf.json",
        logger
    );

    if (getGlobalProdInfo().Board_revision === "05" || getGlobalProdInfo().Board_revision === "06" || getGlobalProdInfo().Board_revision === "07") {
        localConfFunc = (next) => next;
    }

    const f = compose(
        restoreSettingsAction(
            backupDir,
            SETTINGS.loraGlobalConfigs.filePath,
            SETTINGS.loraGlobalConfigs.fileName,
            logger
        ),
        localConfFunc
    )(next);

    f();
}

exports.restoreLoraSettings = restoreLoraSettings;
