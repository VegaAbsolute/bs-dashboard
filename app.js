console.log('---------------------------------------------\r');
console.log('----------------BS-Dashboard-----------------\r');
console.log('---------------------------------------------\r');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const initLogger = require('./src/utils/logger.js').logger(__dirname);
const createBackupFactorySettings = require('./src/pages/device-actions/create-backup-factory-settings.js').createBackupFactorySettings;

initLogger.warn('Run BS-Dashboard.');

try {
    const Session = new (require('./src/pages/authorization/session.js').Session);

    let managerVersion = '';
    let lastVersionData = {
        isAvailableUpdate: false
    };

    const SETTINGS = JSON.parse(fs.readFileSync(__dirname + '/settings.json', 'utf8'));
    const SERVER_PACKAGE = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8'));
    const DASHBOARD_ROOT_DIR = path.join(__dirname, '..');

    const logger = require('./src/utils/logger.js').logger(__dirname, SETTINGS.loggerLevel, SETTINGS.maxLevelForConsoleLogger);

    createBackupFactorySettings(SETTINGS, DASHBOARD_ROOT_DIR + '/backup', logger, () => {
        const ISSUPPORT3G = require('./src/pages/3g-configs/checking-3g-support.js')
            .checking3GSupport(
                SETTINGS.wireless3GConfigs.isSupported,
                SETTINGS.wireless3GConfigs.interfaceManagerFileDir + SETTINGS.wireless3GConfigs.interfaceManagerFileName,
                logger
            );

        logger.info('3G is supported = ' + ISSUPPORT3G);

        let res;
        let req;
        /**
         *  Fetch update info
         *
         */
         process.on('message', (message) => {
             switch (message.cmd) {
                 case 'initial_data': {
                     managerVersion = message.data.managerVersion;
                     break;
                 }
                 case 'update_is_available': {
                     lastVersionData = message.data;
                     break;
                 }
                 case 'update': {
                     logger.info('update =', message.result);

                     if ( message.result === 'update_completed') {
                         res.json({ cmd: req.body.cmd, result: true, msg: 'done' });
                         process.exit(40);
                     } else if (message.result === 'new_version_of_update_is_available') {
                         res.json({ cmd: req.body.cmd, result: true, msg: message.result });
                     } else {
                         res.json({ cmd: req.body.cmd, result: false, msg: message.result });
                     }

                     break;
                 }
                 default: {
                     logger.info('BS-dashboard got message:', message);
                 }
             }
         });

        process.on('disconnect', () => {
            logger.error('Parent process was exited');
            process.exit(-1)
        });

        /*
        * Http server for return front-end application
        *
        */
        const clientApp = express();
        clientApp.use(bodyParser.urlencoded({ extended: false }));
        clientApp.use(bodyParser.json());

        const staticSiteOptions = {
            portnum: SETTINGS.serverConfigs.frontAppPort,
            maxAge: 1000 * 60 * 15
        };

        clientApp.use(express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/about', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/frequency', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/network', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/3g', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/app-settings', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));
        clientApp.use('/actions', express.static(
            path.join(__dirname, 'public'),
            staticSiteOptions
        ));

        clientApp.listen(staticSiteOptions.portnum, (error) => {
            if (error) {
                logger.error(error);
                return false;
            }
            logger.info(`Dashboard - Client app is available on port ${staticSiteOptions.portnum}`);
        });


         /*
         *server API
         *
         */
        const serverApp = express();
        serverApp.use(cors())
        serverApp.use(bodyParser.json())

        const initial = require('./routes/initial');
        const authorizationGet = require('./routes/authorization-get');
        const authorizationPost = require('./routes/authorization-post');
        const globalConfigs = require('./routes/global-configs');
        const frequencyConfigs = require('./routes/frequency-configs');
        const networkConfigs = require('./routes/network-configs');
        const $3g = require('./routes/3g');
        const about = require('./routes/about');
        const appSettings = require('./routes/app-settings');
        const deviceActions = require('./routes/device-actions');

        serverApp.use((request, response, next) => {

            res = response;
            req = request;

            request.appParams = {
                DASHBOARD_ROOT_DIR,
                dirName: __dirname,
                ISSUPPORT3G,
                Session,
                SETTINGS,
                SERVER_PACKAGE,
                lastVersionData,
                managerVersion,

                logger
            }
            next();
        })

        serverApp.use('/initial', initial);
        serverApp.use('/authorization', authorizationGet);
        serverApp.use('/authorization', authorizationPost);
        serverApp.use('/global-configs', globalConfigs);
        serverApp.use('/frequency-configs', frequencyConfigs);
        serverApp.use('/network-configs', networkConfigs);
        serverApp.use('/3g', $3g);
        serverApp.use('/about', about);
        serverApp.use('/app-settings', appSettings);
        serverApp.use('/device-actions', deviceActions);

        // start API server
        const server = serverApp.listen(SETTINGS.serverConfigs.serverPort, (error) => {
            if (error) {
                logger.error(`error: ${error}`);
                return false;
            }
            logger.info(`Dashboard - API server is listening on port ${server.address().port}`);
        });
    })
} catch (err) {
    initLogger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
    process.exit(-1);
}
