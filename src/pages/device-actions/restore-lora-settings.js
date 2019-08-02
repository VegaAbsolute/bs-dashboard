const restoreSettingsAction = require('./restore-settings-action.js').restoreSettingsAction;

const restoreLoraSettings = (SETTINGS, backupDir, logger, next) => {
    restoreSettingsAction(
        backupDir,
        SETTINGS.loraGlobalConfigs.filePath,
        SETTINGS.loraGlobalConfigs.fileName,
        logger)(next)();
}

exports.restoreLoraSettings = restoreLoraSettings;
