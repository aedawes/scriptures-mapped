import { updateMarkers } from './map.js';
import { extractGeoplaces } from './utils.js';

const DIV_SCRIPTURES = "scriptures";

function getScripturesFaliure() {
  document.getElementById(DIV_SCRIPTURES).innerHTML = 'Unable to retrieve chapter contents';
};

function getScripturesSuccess(chapterHtml) {
  document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;
  updateMarkers(extractGeoplaces());
};

export { getScripturesFaliure, getScripturesSuccess };