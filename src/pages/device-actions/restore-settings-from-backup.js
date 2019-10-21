const compose = require('../../utils/compose.js').compose;
const restoreSettingsAction = require('./restore-settings-action.js').restoreSettingsAction;

const restoreSettingsFromBackup = (SETTINGS, backupDir, logger, next) => {
    const f = compose(
        restoreSettingsAction(
            backupDir,
            SETTINGS.loraGlobalConfigs.filePath,
            SETTINGS.loraGlobalConfigs.fileName,
            logger),
        restoreSettingsAction(
            backupDir,
            SETTINGS.loraGlobalConfigs.filePath,
            'local_conf.json',
            logger),
        restoreSettingsAction(
            backupDir,
            SETTINGS.networkConfigs.fileDir,
            SETTINGS.networkConfigs.fileName,
            logger),
        restoreSettingsAction(
            backupDir,
            SETTINGS.networkConfigs.fileDir,
            SETTINGS.networkConfigs.DnsFileName,
            logger),
        restoreSettingsAction(
            backupDir,
            SETTINGS.wireless3GConfigs.fileDir,
            SETTINGS.wireless3GConfigs.fileName,
            logger),
        restoreSettingsAction(
            backupDir,
            SETTINGS.wireless3GConfigs.interfaceManagerFileDir,
            SETTINGS.wireless3GConfigs.interfaceManagerFileName,
            logger)
    )(next);

    f();
}

exports.restoreSettingsFromBackup = restoreSettingsFromBackup;
