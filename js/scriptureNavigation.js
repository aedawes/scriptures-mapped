import { ajax } from "./ajax.js";
import { booksGridContent, volumesGridContent } from "./content.js";
import { getScripturesSuccess, getScripturesFaliure } from "./getScriptures.js";

const URL_BASE = 'https://scriptures.byu.edu/mapscrip/';
const URL_SCRIPTURES = `${URL_BASE}mapgetscrip.php`;

function navigateBook(bookId) {

  const content = `<a href="#">${window.volumes[window.books[bookId].parentBookId - 1].fullName}</a>`
      + `<span class="material-icons">chevron_right</span>`
      + `<a ref="#${window.books[bookId].parentBookId}:${bookId}">${window.books[bookId].fullName}</a>`;
  
  document.getElementById('crumbs').innerHTML = content;
  document.querySelector('#content #crumbs').innerHTML = content;

  document.getElementById('scriptures').innerHTML = `<div id='scripnav'>${booksGridContent(bookId)}</div>`;
}

function navigateChapter(bookId, chapter) {
  ajax(encodedScriptureUrl(bookId, chapter), getScripturesSuccess, getScripturesFaliure, true);
}

function navigateHome(volumeId) {
  const content = `<a id='crumb' href="#">Home</a>`;
  document.getElementById('crumbs').innerHTML = content;
  document.querySelector('#content #crumbs').innerHTML = content;

  document.getElementById('scriptures').innerHTML = `<div id='scripnav'>${volumesGridContent(volumeId)}</div>`;
}

function encodedScriptureUrl(bookId, chapter, verses, isJst) {
  if (bookId !== undefined && chapter !== undefined) {
    let options = '';

    if (verses !== undefined) {
      options += verses;
    }

    if (isJst !== undefined) {
      options += isJst;
    }

    return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses=${options}`;
  }
}

export { navigateHome, navigateBook, navigateChapter };