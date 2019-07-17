const deviceHandler = ({
    cmd,
    data,
    response,
    version,
    SETTINGS,
    DASHBOARD_ROOT_DIR,
    managerVersion,
    lastVersionData,
    logger
}) => {
    switch (cmd) {
        case 'fetch_about_info': {
            const os = require('os');
            const result = {
                server: {
                    version: version,
                    managerVersion: managerVersion.message,
                    update: lastVersionData
                },
                os: {
                    type: os.type(),
                    arch: os.arch(),
                    release: os.release(),
                    platform: os.platform(),
                }
            }
            response.json({ cmd, result: true, data: result });
            break;
        }

        case 'reboot_device': {
            const exec = require('child_process').exec;
            exec('reboot', () => {
                response.json({ cmd, result: true, msg: 'reboot_device' });
                logger.info('Reboot device.');
            });
            break;
        }

        case 'update_server': {
            logger.info('update_server');
            // Send command to Manager
            process.send({ cmd: 'update_confirmed' });
            break;
        }

        case 'set_factory_settings': {
            logger.info('set_factory_settings');
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

        default: {
            logger.error(cmd + ' - unknown_command');
            response.json({ cmd, result: false, msg: 'unknown_command' });
        }
    }
}

exports.deviceHandler = deviceHandler;
