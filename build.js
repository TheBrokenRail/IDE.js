const nwBuilder = require('nw-builder');
const nw = new nwBuilder({
  files: './**/*',
  platforms: ['win32', 'win64', 'linux32', 'linux64', 'osx64'],
  flavor: 'normal',
  appName: 'IDE.js'
});

nw.build().then(function () {
  console.log('Build Successful!');
}).catch(function (error) {
  console.error(error);
});
