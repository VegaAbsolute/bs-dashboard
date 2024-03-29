const fs = require('fs');
const parseObjectByMask = require('./utils/parse-object-by-mask.js').parseObjectByMask;
const readProdInfoFile = require('./read-prod-info-file.js').readProdInfoFile;

const readSettings = (MAIN_DIR, logger, next) => {
    let baseSettings = null;
    let pathRootSettings = '/src/root-settings.json';
    /**
     * Read PROD_INFO file
     */
    let prodInfo = readProdInfoFile();

   // console.log(prodInfo);

    let softwareRevision = 1;
    let tempSoftwareRevision = NaN;
    let validPROD_INFO = typeof prodInfo === 'object' && prodInfo !== null;
    let validSoftwareRevision = validPROD_INFO && prodInfo.Software_revision;
    if(validSoftwareRevision) tempSoftwareRevision = parseInt(prodInfo.Software_revision);
    if(!isNaN(tempSoftwareRevision)) softwareRevision = tempSoftwareRevision;

    if ( softwareRevision >= 2 ) pathRootSettings = '/src/02-root-settings.json';

    
    if(prodInfo.Board_revision == "03" || prodInfo.Board_revision == "04"){
        pathRootSettings = '/src/03-root-settings.json';
    }
    else if(prodInfo.Board_revision == "05" || prodInfo.Board_revision == "06" || prodInfo.Board_revision == "07"){
        pathRootSettings = '/src/05-root-settings.json';
    }


    try {
        const baseSettingsText = fs.readFileSync(MAIN_DIR + pathRootSettings, 'utf8');
        baseSettings = JSON.parse(baseSettingsText);
        logger.verbose('root-settings file was read successfully');
    } catch (e) {
        logger.error('root-settings file was read failure');
        logger.error(e);
    }


    if (baseSettings !== null) {
        let settings = {};
        try {
            const settingsText = fs.readFileSync(MAIN_DIR + '/settings.json', 'utf8');
            settings = JSON.parse(settingsText);
            logger.verbose('settings file was read successfully');
        } catch (e) {
            logger.warn('settings file was read failure');
            logger.warn(e);

            const newSettings = JSON.stringify(baseSettings, null, '\t');
            fs.writeFileSync(MAIN_DIR + '/settings.json', newSettings);
        }

        const mergedConfigs = parseObjectByMask(settings, baseSettings);
        
        next(undefined, mergedConfigs, prodInfo)
    } else {
        next('Fatal error! Cant read root-settings file!!', undefined, undefined)
    }
}

exports.readSettings = readSettings;
