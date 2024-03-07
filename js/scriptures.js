import { ajax } from './ajax.js';
import { bookChapterValid, cacheBooks } from './content.js';
import { navigateBook, navigateChapter, navigateHome } from './scriptureNavigation.js';
//constants------------------------------------------------------------
const URL_BASE = 'https://scriptures.byu.edu/mapscrip/';
const URL_BOOKS = `${URL_BASE}model/books.php`;
const URL_VOLUMES = `${URL_BASE}model/volumes.php`;

//global variables---------------------------------------------------------------
window.books;
window.volumes;

//public API----------------------------------------------------------------------
function init(callback) {
  let booksLoaded = false;
  let volumesLoaded = false;

  ajax(URL_BOOKS, function (data) {
      window.books = data;
      booksLoaded = true;

      if (volumesLoaded) {
        cacheBooks(callback);
      }
    }
  );

  ajax(URL_VOLUMES, function (data) {
      window.volumes = data;
      volumesLoaded = true;

      if (booksLoaded) {
        cacheBooks(callback);
      }
    });

    window.addEventListener('hashchange', onHashChanged);
    onHashChanged(); //FIXME: Look here
};

function onHashChanged(event) {
  let ids = [];
  let volumeId;

  if (location.hash !== '' && location.hash.length > 1) {
    ids = location.hash.slice(1).split(':'); //slice up the hash to get an array of ids
  }

  if (ids.length <= 0) {
    navigateHome(); //if no ids are present, show the home view
  } else if (ids.length === 1) {
    volumeId = Number(ids[0]);

    if (window.volumes.map((volume) => volume.id).includes(volumeId)) {
      navigateHome(volumeId);
    } else {
      navigateHome();
    }
  } else {
    const bookId = Number(ids[1]);

    if (window.books[bookId] === undefined) {
      navigateHome();
    } else {
      if (ids.length === 2) {
        navigateBook(bookId);
      } else {
        const chapter = Number(ids[2]);

        if (bookChapterValid(bookId, chapter)) {
          navigateChapter(bookId, chapter);
        } else {
          navigateHome();
        }
      }
    }
  }
};

export { init, onHashChanged };
