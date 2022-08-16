
const fs = require('fs');
const path = require('path');
let vueFilesList = [];// vue 文件路径列表
let jstsFilesList = [];// ts 文件路径列表
function readFileList(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(item => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // 递归读取文件  
            readFileList(path.join(dir, item), vueFilesList);
        } else if (fullPath.endsWith('.vue')) {
            vueFilesList.push(fullPath);
        } else if (/(.ts|.js)$/g.test(fullPath)) {
            jstsFilesList.push(fullPath);
        }
    });
    return vueFilesList;
}
function writeFile(fileArr, fileName) {
    // 取数字当键名
    let count = 0;
    const reg_1 = /(?<!\/\/\s*.*|<!--\s.*|\/\*\*\s*.*|log\(.*)([\u4e00-\u9fa5|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5｜{|}]*\$?{{0,2}\w*\.*\w*}{0,2}[\u2E80-\u9FFF]+)*/g;
    const obj = fileArr.reduce((pre, cur) => {
        let fileSuffix = cur.match(/(.ts|.js|.vue)$/g)?.[0];
        let pathName = path.basename(cur, fileSuffix);
        // 如果文件名是index,取父级文件名
        if (pathName === 'index') {
            const pathArr = cur.split(path.sep);
            pathName = pathArr[pathArr.length - 2];
        }
        pre[pathName] = {};
        let pkg = fs.readFileSync(cur, 'utf-8');
        const strArr = pkg.match(reg_1);
        if (strArr?.length) {
            strArr.forEach((item, index) => {
                if (item.length) {
                    pre[pathName][count++] = item;

                }

            });
        }
        return pre;
    }, {});
    // 创建json文件
    fs.writeFile(path.resolve(__dirname, `src/lang/${fileName}.json`), JSON.stringify(obj), 'utf8', function (err) {
    });
}

readFileList(path.resolve(__dirname, 'src'), vueFilesList);
fs.stat(path.resolve(__dirname, 'src/lang'), function (err, statObj) {
    // 判断lang目录是否存在，如果不存在则创建，如果创建则直接处理json文件
    if (!statObj) {
        fs.mkdir(path.resolve(__dirname, 'src/lang'), function (err) {
            writeFile(vueFilesList, 'vue');
            writeFile(jstsFilesList, 'js');
        });
    } else {
        writeFile(vueFilesList, 'vue');
        writeFile(jstsFilesList, 'js');
    }
});


