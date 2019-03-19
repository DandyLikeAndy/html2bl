var htmlparser = require("htmlparser2"),
    fs = require("fs"),
    path = require("path"),
    vow = require('vow'),
    promisify = require('vow-node').promisify,
    classes = [],
    stat = promisify(fs.stat);

/**
 * Returns unique CSS class names from html string in source file order.
 * @param {string} html
 * @returns {string[]} class names
 */
function getClasses(html) {
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if(attribs.class){
                attribs.class.split(' ').forEach(function(className) {
                    (classes.indexOf(className) === -1) && classes.push(className);
                });
            }
        },
    }, {decodeEntities: true});
    parser.write(html);
    parser.end();
    return classes;
}

/**
 * Returns file names from CSS classes with redifinition levels on fs.
 * @param {string[]} blocks
 * @param {string[]} levels
 * @param {string} extCssFiles  Extension of the preprocessing CSS file
 * @returns {string[]}
 */
function getFilesFromBlocks(blocks, levels, extCssFiles) {
    if (!extCssFiles) extCssFiles = 'css';
    
    var extFiles = [],
        blockDirs = [];

    return vow.all(levels.map(function(level) {
        return vow.allResolved(blocks.map(function(blockName) {
            var dirName = path.resolve('./' + level + '/' + blockName + '/');
            return stat(dirName).then(function (stats) {
                if (stats.isDirectory()) {
                    blockDirs.push(dirName);
                    var fileName = path.resolve(dirName + '/' + blockName + '.'+ extCssFiles);
                }
                if (fs.statSync(fileName).isFile()) {
                    extFiles.push(fileName);
                }
                return stats;
            });
        }));
    })).then(function() {
        return { [extCssFiles]: extFiles, dirs: blockDirs };
    });
}

/**
 * Returns promise with block directories from html file.
 * Looking on current file tree with redifinition levels.
 * @param {Object} params
 * @param {(string|string[])} params.htmlSrc html files name for parsing
 * @param {(string|string[])} params.levels — redefinition levels
 * @param {string} params.extCssFiles extension of the preprocessing CSS file
 *
 */
exports.getFileNames = function(params) {
    var htmlSrc = '',
        blocks = null;

    if (typeof params.htmlSrc === 'string' ) {
        htmlSrc = fs.readFileSync(params.htmlSrc, 'utf8');
    } else if (params.htmlSrc instanceof Array) {
        params.htmlSrc.forEach(function(html) {
            htmlSrc += '\n' + fs.readFileSync(html, 'utf8');
        });
    }
    blocks = getClasses(htmlSrc);
   
    return getFilesFromBlocks(blocks, params.levels, params.extCssFiles).then(function(files) {
        return files;
    });
};
