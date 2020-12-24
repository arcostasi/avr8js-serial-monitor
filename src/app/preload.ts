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

  let tab1 = document.createElement("button");

  // Assign different attributes to the element
  tab1.setAttribute("name", "tab-1");
  tab1.setAttribute("class", "tablink");
  tab1.setAttribute("id", "defaultOpen");
  tab1.innerText = "Monitor Serial";
  tab1.onclick = function() {
    openPage('monitor', this, '#555');
  }

  document.getElementById("monitor-tab").appendChild(tab1);

  let tab2 = document.createElement("button");

  tab2.setAttribute("name", "tab-2");
  tab2.setAttribute("class", "tablink");
  tab2.innerText = "Plotter Serial";
  tab2.onclick = function() {
    openPage('plotter', this, '#555');
  }

  document.getElementById("monitor-tab").appendChild(tab2);

  // Get the element with id="defaultOpen" and click on it
  tab1.click();
});

function openPage(pageName: string, element: any, color: string) {
  // Hide all elements with class="tabcontent" by default */
  let tabContent = document.querySelectorAll<HTMLElement>(".tabcontent");

  tabContent.forEach((tab) => {
    tab.style.display = "none";
  })

  // Remove the background color of all tablinks/buttons
  let tabLinks = document.querySelectorAll<HTMLElement>(".tablink");

  tabLinks.forEach((tab) => {
    tab.style.backgroundColor = "";
  })

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";

  // Add the specific color to the button used to open the tab content
  element.style.backgroundColor = color;
}

// Change titlebar color
new Titlebar({
  backgroundColor: Color.fromHex('#444')
});
