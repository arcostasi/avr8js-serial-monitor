import { Titlebar, Color } from 'custom-electron-titlebar'
import * as ed from './editor'

// Using CommonJS modules
const fs = require('fs')
let json = require('../../examples/settings.json');

document.addEventListener('DOMContentLoaded', (event) => {

  json.projects.forEach((data: any, index: any) => {

    let board = 'uno';
    let ext = 'ino';

    if (data.board != undefined) {
      board = data.board;
    }

    if (data.ext != undefined) {
     ext = data.ext;
    }

    let button = document.createElement("button");

    // Assign different attributes to the element
    button.setAttribute("name", "btn-" + index);
    button.setAttribute("class", "btn-white");
    button.innerText = data.name;
    button.onclick = function() {
      ed.loader(data.path, data.name, data.files, board, ext);
    }

    document.getElementById("editor-tab").appendChild(button);
  });

  if (json.settings.debug != undefined) {
    ed.setDebug(json.settings.debug);
  }

  // Load start
  ed.loader('./examples/blink/', 'blink', [], 'uno', 'cpp');
});

// Change titlebar color
new Titlebar({
  backgroundColor: Color.fromHex('#444')
});
