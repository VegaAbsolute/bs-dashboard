const deviceActionsHandler = ({
    cmd,
    data,
    response,
    SETTINGS,
    DASHBOARD_ROOT_DIR,
    logger,
    getState
}) => {
    logger.debug('deviceActionsHandler');
    logger.silly(data);

    switch (cmd) {


        case 'reboot_device': {
            logger.silly('handler case: reboot_device');
            const exec = require('child_process').exec;
            exec('reboot', () => {
                response.json({ cmd, result: true, msg: 'reboot_device' });
                logger.info('Reboot device.');
                process.exit(50);
            });
            break;
        }


        case 'reboot_server': {
            logger.silly('handler case: reboot_server');
            response.json({ cmd, result: true, msg: 'reboot_server' });
            logger.info('Reboot dashboard.');
            process.exit(40);
            break;
        }


        // TODO: make mechanism in dashboard-manager
        case 'shutdown_server': {
            logger.silly('handler case: shutdown_server');
            response.json({ cmd, result: true, msg: 'shutdown_server' });
            logger.info('Shutdown dashboard.');
            process.exit(41);
            break;
        }


        case 'update_server': {
            logger.silly('handler case: update_server');
            logger.info('update_server');
            // Send command to Manager
            const stageDescription = getState().update.stageDescription;
            if (stageDescription !== 'INSTALLED' && stageDescription !== 'IN_PROCESS') {
                process.send({ cmd: 'update_confirmed' });
            } else {
                response.json({ cmd, result: false, msg: stageDescription });
            }
            break;
        }


        case 'set_factory_settings': {
            logger.silly('handler case: set_factory_settings');
            const restoreSettingsFromBackup = require('./restore-settings-from-backup.js').restoreSettingsFromBackup;
            restoreSettingsFromBackup(
                SETTINGS,
                DASHBOARD_ROOT_DIR + '/backup',
                logger,
                ()=>{
                response.json({ cmd, result: true, msg: 'success' });
            });
            break;
        }


        case 'set_factory_lora_settings': {
            logger.silly('handler case: set_factory_lora_settings');
            const restoreLoraSettings = require('./restore-lora-settings.js').restoreLoraSettings;
            restoreLoraSettings(
                SETTINGS,
                DASHBOARD_ROOT_DIR + '/backup',
                logger,
                ()=>{

                    // Reboot LoRa
                    if (SETTINGS.serverConfigs.isRebootLoraOnSaveConfigs) {
                        const exec = require('child_process').exec;
                        exec('killall lora_pkt_fwd', () => {
                            logger.info('Reboot LoRa.');
                        });
                    }

                    response.json({ cmd, result: true, msg: 'success' });
            });
            break;
        }


        default: {
            logger.silly('handler case: default');
            logger.warn(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.deviceActionsHandler = deviceActionsHandler;
