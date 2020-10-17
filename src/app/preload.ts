import { Titlebar, Color } from 'custom-electron-titlebar'

const fs = require('fs')
let json = require('../../examples/settings.json');

// Get Loader
declare function loader(path: any, name: any, files: any, board: any): any;
declare function setDebug(value: boolean): any;

document.addEventListener('DOMContentLoaded', (event) => {

  json.projects.forEach((data: any, index: any) => {

    let loader = "loader('" + data.path + "','"
                            + data.name + "'";

    if (data.files != undefined) {
      loader += ",'" + data.files + "'";
    } else {
      loader += ",''";
    }

    if (data.board != undefined) {
      loader += ",'" + data.board + "'";
    }

    loader += ");";

    document.getElementById("editor-tab").innerHTML +=
      '<button class="btn-white" onclick="' + loader + '">' + data.name + "</button>";
  });

  if (json.settings.debug != undefined) {
    setDebug(json.settings.debug);
  }

  // Load initial
  loader('./examples/blink/', 'blink', '', 'uno');
});

// Change titlebar color
new Titlebar({
  backgroundColor: Color.fromHex('#444')
});
