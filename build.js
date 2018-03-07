var nwBuilder = require('nw-builder');
var nw = new nwBuilder({
  files: './**/**',
  platforms: ['win', 'linux', 'osx'],
  flavor: 'normal',
  appName: 'IDE.js'
});

nw.build().then(function () {
  console.log('Build Successful!');
}).catch(function (error) {
  console.error(error);
});
