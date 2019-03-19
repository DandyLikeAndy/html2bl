## Html2Bl

Tiny little script for getting blocks dirs from HTML file with redefinition levels.

```js
var params = { 
    levels: ['common.blocks', 'project.blocks'], 
    htmlSrc: ['index.html', 'about.html'], // or 'index.html'
    extCssFiles: 'scss' //default extCssFiles: 'css'
},
    getFileNames = require('html2bl').getFileNames(params);

getFileNames.then(function(files) {
    // your logic here
})
.done()
```