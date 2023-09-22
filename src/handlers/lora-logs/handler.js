const exec = require("child_process").exec;

function getLogs_r5(){
    return new Promise((resolve,reject) => {
        exec("journalctl -n 25 -u lora_pkt_fwd", (err, stdout, stderr) => {
            if(err){
                reject(err);
            }

            const currentTime = Date.now();
            const logLines = stdout.split("\n");
            const resultLogs = logLines.map((value, index) => ({ rowId: currentTime + index, row: value }));

            resolve(resultLogs)
        });
    }) 
}

const loraLogsHandler = (/*{cmd, loginToken, LoraLogger, response, logger}*/{
    request,
    response,

    logger,
    Session,
    LoraLogger,

    getState,
    appParams
}) => {
    logger.debug('loraLogsHandler');

    try {
        const { cmd = '', data = {}, loginToken = '' } = request.body;
        const {
            SETTINGS,
            PROD_INFO,
            DASHBOARD_ROOT_DIR,
            SERVER_PACKAGE,
            dirName
        } = appParams;

        logger.info(`cmd = ${cmd}`);
        logger.silly(data);

        if (!Session.checkToken(loginToken, request.headers.origin)) {
            logger.warn('login_incorrect');
            response.json({ cmd, result: false, msg: 'login_not_performed' });
            return;
        }

        logger.info('login_correct');

        switch (cmd) {
            case "get_lora_log": {
                logger.silly("handler case: get_lora_log");

                if (PROD_INFO.Board_revision === "05" || PROD_INFO.Board_revision === "06" || PROD_INFO.Board_revision === "07") {

                    getLogs_r5().then((logs) => {
                        const result = {
                            cmd: "get_lora_log",
                            result: true,
                            msg: "success",
                            data: logs,
                        };
                        response.json(result);
                    });
                    
                } else {
                    const logData = LoraLogger.getLog(loginToken);
                    const result = {
                        cmd: "get_lora_log",
                        result: true,
                        msg: "success",
                        data: logData,
                    };
                    response.json(result);
                }

                break;
            }

            default: {
                logger.silly("handler case: default");
                logger.warn(cmd + " - unknown_command");
                response.json({ cmd, result: false, msg: "unknown_command" });
            }
        }
    } catch (error) {
        logger.error(error.name + "\n\r" + error.message + "\n\r" + error.stack);
        response.json({ cmd: 'SERVER_ERROR', result: false, msg: 'SERVER ERROR: [' + error.name + '] -' + error.message });
    }
}

exports.handler = loraLogsHandler;
