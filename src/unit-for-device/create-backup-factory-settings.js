const fs = require('fs');
const compose = require('../utils/compose.js').compose;

const createBackupFactorySettings = (SETTINGS, DASHBOARD_ROOT_DIR, logger, next) => {
    logger.info('Check backup factory settings files.');
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
        return next;
    } else {
        logger.verbose(`Backup for file "${fileName}" not found.`);
        return createBackup(destinationDir, filePath, fileName, logger)(next);
    }
}

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

const createBackup = (destinationDir, filePath, fileName, logger) => (next) => {
    logger.verbose('Create backup for: ' + fileName);
    const isExistsRequiredFile = fs.existsSync(filePath + fileName);
    if (isExistsRequiredFile) {
        mkdirSync(destinationDir);
        // Copy file
        fs.writeFileSync(destinationDir + '/' + fileName, fs.readFileSync(filePath + fileName));
        return next;
    } else {
        logger.error(`Source file not found! - ` + filePath + fileName);
        return () => {}
    }
}

exports.createBackupFactorySettings = createBackupFactorySettings;
