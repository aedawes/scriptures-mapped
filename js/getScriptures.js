import { updateMarkers } from './map.js';
import { extractGeoplaces } from './utils.js';
import { renderNavigationArrows } from "./utils.js";

const DIV_SCRIPTURES = "scriptures";

function getScripturesFaliure() {
  document.getElementById(DIV_SCRIPTURES).innerHTML = 'Unable to retrieve chapter contents';
};

function getScripturesSuccess(chapterHtml) {
  let ids = [];

  if (location.hash !== '' && location.hash.length > 1) {
    ids = location.hash.slice(1).split(':'); //slice up the hash to get an array of ids
  }

  const bookId = Number(ids[1]);
  const chapter = Number(ids[2]);

  document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

  renderNavigationArrows(bookId, chapter);

  updateMarkers(extractGeoplaces());
};

export { getScripturesFaliure, getScripturesSuccess };