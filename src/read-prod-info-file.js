const fs = require('fs');

const readProdInfoFile = (filePath) => {
    try {
        const array = fs.readFileSync(filePath, 'utf8').toString().split("\n");

        const prodInfo = array.reduce((prev, el) => {
            const indexOfSeparator = el.indexOf(':');

            if (indexOfSeparator > 0) {
                const key = el.substring(0, indexOfSeparator).trim();
                let val = el.substring(indexOfSeparator + 1).trim();
                if (val === 'null') {
                    val = null;
                }
                return Object.assign(prev, {[key] : val})
            } else {
                return prev;
            }

        }, {})

        return prodInfo;
    } catch(e) {
        return {
            Model: '---',
            Board_revison: '---',
            GSM: '---',
            GNSS: '---',
            Date: '---'
        }
    }
}

exports.readProdInfoFile = readProdInfoFile;
