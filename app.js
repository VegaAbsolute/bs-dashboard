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



let dashboardState = {
    update: {
        managerVersion: '',
        lastVersionData: {
            isAvailableUpdate: false
        },
        updateState: 'NO', // 'NO', 'AVAILABLE', 'IN_PROCESS', 'FAILURE', INSTALLED
        stageDescription: [] // Array
    }
}

/*
lastVersionData:{
		"isAvailableUpdate": true,
		"dashboardVersion": {
			"date": "2019-08-23T08:18:22.000Z",
			"message": "s-0.5.0/c-0.5.0",
			"level": "silly",
			"isAvailableUpdate": true
		},
		"managerVersion": {
			"date": "2019-08-22T09:59:11.000Z",
			"message": "0.1.5",
			"level": "silly",
			"isAvailableUpdate": true
		}
    }
*/



initLogger.warn('Run BS-Dashboard.');

try {
    const Session = new (require('./src/pages/authorization/session.js').Session);
    const readSettings = require('./src/read-settings.js').readSettings;
    readSettings(__dirname, initLogger, (err, settings) => {
        if (err) {
            initLogger.error(err);
            process.exit(-1);
        } else {
            const SETTINGS = settings;



            const SERVER_PACKAGE = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8'));
            const DASHBOARD_ROOT_DIR = path.join(__dirname, '..');

            const logger = require('./src/utils/logger.js').logger(__dirname, SETTINGS.loggerLevel, SETTINGS.maxLevelForConsoleLogger);

            createBackupFactorySettings(SETTINGS, DASHBOARD_ROOT_DIR + '/backup', logger, () => {
                const readProdInfoFile = require('./src/read-prod-info-file.js').readProdInfoFile;

                
                /**
                 * Read PROD_INFO file
                 */
                const PROD_INFO = readProdInfoFile('/home/root/PROD_INFO');


                logger.silly(PROD_INFO);

                const ISSUPPORT3G = (SETTINGS.wireless3GConfigs.isSupported === 'auto') ? (
                    PROD_INFO.GSM !== null
                ) : (
                    SETTINGS.wireless3GConfigs.isSupported === 'true'
                )

                /**
                 * Check via "interface_manager" file that this device is supporting 3G.
                 */
                /*const ISSUPPORT3G = require('./src/pages/3g-configs/checking-3g-support.js')
                    .checking3GSupport(
                        SETTINGS.wireless3GConfigs.isSupported,
                        SETTINGS.wireless3GConfigs.interfaceManagerFileDir + SETTINGS.wireless3GConfigs.interfaceManagerFileName,
                        logger
                    );*/

                logger.verbose('3G is supported = ' + ISSUPPORT3G);

                let res;
                let req;
                /**
                 *  Fetch update info
                 *
                 */
                process.on('message', (message) => {
                    logger.silly(message);
                     switch (message.cmd) {
                         case 'initial_data': {
                             dashboardState.update.managerVersion = message.data.managerVersion;
                             break;
                         }


                         case 'update_is_available': {
                             // TODO: disable checking updates in manager when application is installing updates
                             if (dashboardState.update.updateState !== 'IN_PROCESS') {
                                 dashboardState.update = Object.assign(dashboardState.update, {
                                     lastVersionData: message.data,
                                     updateState: 'AVAILABLE'
                                 })
                             } else {
                                 dashboardState.update.lastVersionData = message.data;
                             }
                             break;
                         }


                         case 'update_started': {
                             dashboardState.update = Object.assign(dashboardState.update, {
                                 updateState: 'IN_PROCESS',
                                 stageDescription: []
                             });

                             logger.info('update_started');
                             res.json({ cmd: req.body.cmd, result: true, msg: 'update_started' });
                             break;
                         }


                         case 'update_process_new_stage': {
                             dashboardState.update = Object.assign(dashboardState.update, {
                                 updateState: 'IN_PROCESS',
                                 stageDescription: [
                                     ...dashboardState.update.stageDescription,
                                     message.stage
                                 ]
                             })
                             break;
                         }


                         case 'update_failure': {
                             dashboardState.update = Object.assign(dashboardState.update, {
                                 updateState: 'FAILURE',
                                 stageDescription: [
                                     ...dashboardState.update.stageDescription,
                                     message.error
                                 ]
                             });
                             logger.warn('update failure');
                             logger.silly(dashboardState.update);
                             break;
                         }


                         case 'update_completed': {
                             dashboardState.update = Object.assign(dashboardState.update, {
                                 updateState: 'INSTALLED'
                             });
                             logger.info('update completed');
                             logger.silly(dashboardState.update);
                             setTimeout(()=>{
                                 process.exit(40);
                             }, 10000);

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
                clientApp.use('/lora-logs', express.static(
                    path.join(__dirname, 'public'),
                    staticSiteOptions
                ));
                clientApp.use('/other-lora-configs', express.static(
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
                clientApp.use('/gps-lora-configs', express.static(
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
                    logger.info(`Dashboard - Client app is available on port ${staticSiteOptions.portnum}.`);
                });

                const LoraLogger = new (require('./src/pages/lora-logs/lora-logger.js').LoraLogger)({logger, Session});
                LoraLogger.listen({host: '127.0.0.1', port: 3003});

                 /*
                 *server API
                 *
                 */
                const serverApp = express();
                serverApp.use(cors())
                serverApp.use(bodyParser.json());
                let appParams = {
                    DASHBOARD_ROOT_DIR,
                    PROD_INFO,
                    dirName: __dirname,
                    ISSUPPORT3G,
                    Session,
                    SETTINGS,
                    SERVER_PACKAGE,

                    logger
                }

                const initial = require('./routes/initial');
                const getStateRoute = require('./routes/get-state');
                const loraLogs = require('./routes/lora-logs');
                const loraOtherConfigs = require('./routes/lora-other-configs');
                const authorizationGet = require('./routes/authorization-get');
                const authorizationPost = require('./routes/authorization-post');
                const globalConfigs = require('./routes/global-configs');
                const frequencyConfigs = require('./routes/frequency-configs');
                const networkConfigs = require('./routes/network-configs');
                const $3g = require('./routes/3g');
                const loraGpsConfigs = require('./routes/lora-gps');
                const about = require('./routes/about');
                const appSettings = require('./routes/app-settings');
                const deviceActions = require('./routes/device-actions');

                serverApp.use((request, response, next) => {

                    res = response;
                    req = request;

                    request.appParams = appParams;
                    next();
                });


                serverApp.use('/initial', initial);
                serverApp.use('/get-state', getStateRoute({logger, Session, getState: ()=>dashboardState}));
                serverApp.use('/authorization', authorizationGet);
                serverApp.use('/authorization', authorizationPost);
                serverApp.use('/global-configs', globalConfigs);
                serverApp.use('/frequency-configs', frequencyConfigs);
                serverApp.use('/lora-logs', loraLogs({logger, LoraLogger, Session}));
                serverApp.use('/lora-other-configs', loraOtherConfigs(appParams));
                serverApp.use('/lora-gps-configs', loraGpsConfigs(appParams));
                serverApp.use('/network-configs', networkConfigs);
                serverApp.use('/3g', $3g);
                serverApp.use('/about', about(appParams, ()=>{return {lastVersionData: dashboardState.update.lastVersionData, managerVersion: dashboardState.update.managerVersion}}));
                serverApp.use('/app-settings', appSettings);
                serverApp.use('/device-actions', deviceActions({logger, Session, getState: ()=>dashboardState}));

                serverApp.get('/ping', (req, res) => {
                    res.json({ result: true });
                })

                // start API server
                const server = serverApp.listen(SETTINGS.serverConfigs.serverPort, (error) => {
                    if (error) {
                        logger.error(`error: ${error}`);
                        return false;
                    }
                    logger.info(`Dashboard - API server is listening on port ${server.address().port}.`);
                });
            })
        }
    });
} catch (err) {
    initLogger.error(err.name + "\n\r" + err.message + "\n\r" + err.stack);
}
