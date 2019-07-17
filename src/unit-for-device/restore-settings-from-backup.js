const compose = require('../utils/compose.js').compose;
const fs = require('fs');

const restoreSettingsFromBackup = (SETTINGS, DASHBOARD_ROOT_DIR, logger, next) => {
    const f = compose(
        checkForFileExist(
            DASHBOARD_ROOT_DIR,
            SETTINGS.loraGlobalConfigs.filePath,
            SETTINGS.loraGlobalConfigs.fileName,
            logger),
        checkForFileExist(
            DASHBOARD_ROOT_DIR,
            SETTINGS.networkConfigs.filePath,
            SETTINGS.networkConfigs.fileName,
            logger),
        checkForFileExist(
            DASHBOARD_ROOT_DIR,
            SETTINGS.wireless3GConfigs.filePath,
            SETTINGS.wireless3GConfigs.fileName,
            logger)
    )(next);

    f();
}

const checkForFileExist = (destinationDir, filePath, fileName, logger) => (next) => {
    logger.verbose('Check buckup for: ' + fileName);
    const result = fs.existsSync(destinationDir + '/' + fileName);
    if (result) {
        logger.verbose(`Backup for file "${fileName}" is exists.`);
        return copyFile(destinationDir, filePath, fileName, logger)(next);
    } else {
        logger.verbose(`Backup for file "${fileName}" not found.`);
        return next;
    }
}

const copyFile = (destinationDir, filePath, fileName, logger) => (next) => {
    logger.verbose('Restore backup for: ' + fileName);
    // Copy file
    fs.writeFileSync(filePath + fileName, fs.readFileSync(destinationDir + '/' + fileName));
    return next;
}

exports.restoreSettingsFromBackup = restoreSettingsFromBackup;
