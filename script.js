nw.Window.get().maximize();
var menu = new nw.Menu();
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const opn = require('opn');

var terminalInstance = null;
var projectDir = '\\\\notSet';
var picker = document.getElementById('folderPicker');
picker.click();
picker.onchange = function () {
  projectDir = picker.value;
  buildStructure(filesDiv, 0, projectDir);
};
var menubar = new nw.Menu({type: 'menubar'});
var filemenu = new nw.Menu();
filemenu.append(new nw.MenuItem({
  label: 'Close Directory',
  click: function () {
    if (terminalInstance) {
      terminalInstance.kill();
    }
    projectDir = '\\\\notSet';
    buildStructure(filesDiv, 0, projectDir);
  }
}));
filemenu.append(new nw.MenuItem({
  label: 'Open Directory',
  click: function () {
    if (terminalInstance) {
      terminalInstance.kill();
    }
    picker.click();
  }
}));
filemenu.append(new nw.MenuItem({
  label: 'Kill Terminal Instance',
  click: function () {
    if (terminalInstance) {
      terminalInstance.kill();
    }
  }
}));
menubar.append(new nw.MenuItem({
  label: 'File',
  submenu: filemenu
}));
nw.Window.get().menu = menubar;

var editor = CodeMirror.fromTextArea(document.getElementById('displayEditor'), {
  mode:  'null',
  lineNumbers: true,
  theme: 'dracula'
});
var currentFile = '';
var terminal = '';
var terminalTempStdin = '';
var terminalUpdate = false;
var terminalStdin = null;
editor.on('change', function (instance, changeObj) {
  if (currentFile !== '\\\\terminal') {
    if (currentFile.length > 0) {
      fs.writeFileSync(currentFile, editor.getValue());
    }
  } else {
    if (terminalUpdate) {
      terminalTempStdin = '';
      terminalUpdate = false;
    }
  }
});

function setValueSafe(value) {
  var scrollInfo = editor.getScrollInfo();
  editor.setValue(value);
  editor.scrollTo(scrollInfo.left, scrollInfo.top);
}

editor.on('keydown', function (instance, event) {
  var key = event.key;
  if (key === 'Enter') {
    key = '\n';
  }
  if (terminalStdin && terminalStdin.writable && key !== 'Shift') {
    terminal = terminal;
    terminalTempStdin = terminalTempStdin + key;
    setValueSafe(terminal + terminalTempStdin);
    terminalStdin.write(key, 'utf8');
  }
});

function runCommand(cmd, args) {
  try {
    if (document.getElementById('selectedFile')) {
      document.getElementById('selectedFile').id = '';
    }
    document.getElementById('files').lastChild.id = 'selectedFile';
    currentFile = '\\\\terminal';
    editor.setOption('mode', 'null');
    terminal = '';
    terminalStdin = null;
    if (terminalInstance) {
      terminalInstance.kill();
    }
    var instance = spawn(cmd, args);
    terminalStdin = instance.stdin;
    terminalInstance = instance;
    instance.stdout.on('data', function (chunk) {
      terminal = terminal + chunk.toString();
      if (currentFile === '\\\\terminal') {
        terminalUpdate = true;
        setValueSafe(terminal);
      }
    });
    setValueSafe(terminal);
  } catch (e) {
    alert(e.toString());
  }
}

var filesDiv = document.getElementById('files');
filesDiv.innerHTML = '';
function buildStructure(filesDiv, indent, dir) {
  if (projectDir !== '\\\\notSet') {
    var files = fs.readdirSync(dir);
  } else {
    var files = [];
  }
  if (indent === 0) {
    files.push('\\\\terminal');
  }
  filesDiv.innerHTML = '';
  filesDiv.style.userSelect = 'none';
  for (let i = 0; i < files.length; i++) {
    let file = document.createElement('SPAN');
    let icon = document.createElement('SPAN');
    icon.style.fontFamily = 'Wingdings';
    icon.style.paddingRight = '6px';
    let stats = null;
    if (files[i] !== '\\\\terminal') {
      stats = fs.statSync(dir + '/' + files[i]);
      if (stats.isDirectory()) {
        icon.appendChild(document.createTextNode('1'));
      } else {
        icon.appendChild(document.createTextNode('2'));
      }
    } else {
      icon.appendChild(document.createTextNode(':'));
    }
    file.appendChild(icon);
    if (files[i] !== '\\\\terminal') {
      file.appendChild(document.createTextNode(files[i]));
    } else {
      file.appendChild(document.createTextNode('Terminal'));
    }
    file.style.display = 'block';
    file.style.color = 'white';
    file.style.padding = '6px';
    file.style.fontFamily = 'sans-serif';
    file.style.paddingLeft = (indent + 6) + 'px';
    file.setAttribute('class', 'file');
    filesDiv.appendChild(file);
    if (files[i] !== '\\\\terminal' && stats.isDirectory()) {
      let newDiv = document.createElement('DIV');
      newDiv.style.display = 'none';
      file.parentNode.insertBefore(newDiv, file.nextSibling);
      let open = false;
      file.addEventListener('click', function () {
        if (!open) {
          newDiv.style.display = 'block';
          buildStructure(newDiv, indent + 12, dir + '/' + files[i]);
          open = true;
        } else {
          newDiv.innerHTML = '';
          newDiv.style.display = 'none';
          open = false;
        }
      });
      file.addEventListener('contextmenu', function (event) {
        menu.appendFile(new nw.MenuItem({
          label: 'Delete Folder',
          click: function () {
            try {
              fs.rmdirSync(dir + '/' + files[i]);
              buildStructure(filesDiv, 0, projectDir);
            } catch(e) {
              alert(e.toString());
            }
          }
        }));
      });
    } else {
      file.addEventListener('click', function () {
        if (files[i] !== '\\\\terminal') {
          var fileItem = fs.readFileSync(dir + '/' + files[i], 'utf8');
          if (fileItem === 'undefined') fileItem = '';
          currentFile = dir + '/' + files[i];
          editor.setOption('readOnly', false);
        } else {
          var fileItem = terminal;
          currentFile = '\\\\terminal';
          terminalUpdate = true;
          editor.setOption('readOnly', true);
        }
        setValueSafe(fileItem);
        if (currentFile.endsWith('.js')) {
          editor.setOption('mode', 'javascript');
        } else if (currentFile.endsWith('.html')) {
          editor.setOption('mode', 'htmlmixed');
        } else if (currentFile.endsWith('.css')) {
          editor.setOption('mode', 'css');
        } else if (currentFile.endsWith('.jsx')) {
          editor.setOption('mode', 'jsx');
        } else if (currentFile.endsWith('.md')) {
          editor.setOption('mode', 'markdown');
        } else if (currentFile.endsWith('.xml')) {
          editor.setOption('mode', 'xml');
        } else if (currentFile.endsWith('.json')) {
          editor.setOption('mode', {name: 'javascript', json: true});
        } else {
          editor.setOption('mode', 'null');
        }
        if (document.getElementById('selectedFile')) {
          document.getElementById('selectedFile').id = '';
        }
        file.id = 'selectedFile';
      });
      file.addEventListener('contextmenu', function (event) {
        if (files[i] !== '\\\\terminal') {
          menu.append(new nw.MenuItem({
            label: 'Delete File',
            click: function () {
              try {
                fs.unlinkSync(dir + '/' + files[i]);
                buildStructure(filesDiv, 0, projectDir);
              } catch(e) {
                alert(e.toString());
              }
            }
          }));
        }
        if (files[i].endsWith('.js')) {
          menu.append(new nw.MenuItem({
            label: 'Run In NodeJS',
            click: function () {
              runCommand('node', [dir + '/' + files[i]]);
            }
          }));
        } else if (files[i].endsWith('.html')) {
          menu.append(new nw.MenuItem({
            label: 'Run In Web Browser',
            click: function () {
              opn('file://' + path.resolve(global.__dirname, dir + '/' + files[i]));
            }
          }));
        }
      });
    }
  }
}
buildStructure(filesDiv, 0, projectDir);

function buildMenu() {
  menu = new nw.Menu();
  menu.append(new nw.MenuItem({
    label: 'New File',
    click: function () {
      var name = prompt('New File');
      try {
        fs.writeFileSync('project/' + name);
        buildStructure(filesDiv, 0, projectDir);
      } catch(e) {
        alert(e.toString());
      }
    }
  }));
  menu.append(new nw.MenuItem({
    label: 'New Folder',
    click: function () {
      var name = prompt('New File');
      try {
        fs.mkdirSync('project/' + name);
        buildStructure(filesDiv, 0, projectDir);
      } catch(e) {
        alert(e.toString());
      }
    }
  }));
}
buildMenu();

document.getElementById('files').addEventListener('contextmenu', function (event) {
  event.preventDefault();
  menu.popup(event.x, event.y);
  buildMenu();
  return false;
}, false);
