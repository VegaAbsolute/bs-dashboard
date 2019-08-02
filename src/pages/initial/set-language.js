const fs = require('fs');
const mergeDeep =  require('../../utils/merge-deep.js').mergeDeep;

const setLanguage = ({SETTINGS, cmd, response, filePath, data, logger}) => {

    //prepare valid data
    const language = data.substr(0, 2);
    logger.silly(language);

    SETTINGS.serverConfigs.language = language;

    const text = fs.readFileSync(filePath, 'utf8');
    const previousConfigs = (JSON.parse(text));

    // merge configs and write to file
    const resultConfigs = mergeDeep(previousConfigs, {serverConfigs: { language }});

    const stringResultConfigs = JSON.stringify(resultConfigs, null, '\t');
    fs.writeFileSync(filePath, stringResultConfigs);

    response.json({ cmd, result: true, msg: "success" })
}

exports.setLanguage = setLanguage;
