const scriptures = ( function () {
  "use strict";

  //constants------------------------------------------------------------
  const DIV_SCRIPTURES = "scriptures";
  const REQUEST_GET = "GET";
  const REQUEST_STATUS_ERROR = 400;
  const REQUEST_STATUS_OK = 200;
  const URL_BASE = 'https://scriptures.byu.edu/mapscrip/';
  const URL_BOOKS = `${URL_BASE}model/books.php`;
  const URL_SCRIPTURES = `${URL_BASE}mapgetscrip.php`;
  const URL_VOLUMES = `${URL_BASE}model/volumes.php`;

  //private variables---------------------------------------------------------------
  let books;
  let mapMarkers = [];
  let volumes;

  //private method declarations-----------------------------------------------------
  let ajax;
  let bookChapterValid;
  let booksGrid;
  let booksGridContent;
  let bookTitle;
  let cacheBooks;
  let chapterGrid;
  let clearMapPins;
  let createLabel;
  let encodedScriptureUrl;
  let existingHref;
  let extractGeoplaces;
  let findNextChapter;
  let getScripturesFaliure;
  let getScripturesSuccess;
  let init;
  let navigateBook;
  let navigateChapter;
  let navigateHome;
  let onHashChanged;
  let renderNavigationArrows;
  let updateMarkers;
  let volumesGridContent;
  let volumeTitle;

  //private methods-----------------------------------------------------------------
  ajax = function (url, successCallback, failureCallback, skipJsonParse) {
    let request = new XMLHttpRequest();

    request.open( REQUEST_GET, url, true );

    request.onload = function () {
      if ( request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR ) {
        // Success!
        let data = skipJsonParse ? request.response : JSON.parse( request.response );

        if ( typeof successCallback === "function" ) {
          successCallback( data );
        }
      } else {
        // We reached our target server, but it returned an error
        if ( typeof failureCallback === "function" ) {
          failureCallback(request);
        }
      }
    }
    request.onerror = failureCallback;
    request.send();
  };

  bookChapterValid = function (bookId, chapter) {
    const book = books[bookId];

    if (book === undefined) {
      return false;
    }

    if (chapter === book.numChapters) {
      return true;
    }

    if (Number.isInteger(chapter) && !String(chapter).includes('.')){
      return true;
    }

    if (chapter >= 1 && chapter <= book.numChapters) {
      return true;
    }

    return false;
  };

  booksGrid = function (volume) {
    let gridContent = `<div class='books'>`;

    volume.books.forEach (book => {
      gridContent += `<a id='${book.id}' href='#${volume.id}:${book.id}'>${book.gridName}</a>`;
    });

    return `${gridContent}</div>`;
  };

  booksGridContent = function (bookId) {
    let gridContent = '';

    for (let book in books) {
      if (bookId === undefined || bookId === books[book].id) {
        gridContent += `<div class='volume'>${bookTitle(books[book])}</div>`;
        gridContent += chapterGrid(books[book]);
      }
    }

    return gridContent;
  };

  bookTitle = function (book) {
    return `<a href='${existingHref}:${book.id}'><h1>${book.fullName}</h1></a>`;
  };

  cacheBooks = function (callback) {
    volumes.forEach (function (volume) {
      let volumeBooks = [];
      let bookId = volume.minBookId;
      
      while (bookId <= volume.maxBookId) {
        volumeBooks.push(books[bookId]);
        bookId++;
      }
      
      volume.books = volumeBooks;
    });
    
    if (typeof callback === "function") {
      callback();
    }
  };
  
  chapterGrid = function (book) {
    let gridContent = `<div class='books'>`;

    for (let i = 1; i <= book.numChapters; i++) {
      gridContent += `<a class='chapter' id='${i}' href='#${book.parentBookId}:${book.id}:${i}'>${i}</a>`;
    }
    return `${gridContent}</div>`;
  }

  clearMapPins = function () {

    mapMarkers.forEach (marker => {
      marker.setMap(null);
    });

    mapMarkers = [];
  }

  createLabel = function (geoplace) {
    let uniqueLabels = new Set();

    //ChatGPT helped me with this function, specifically the label creation
    const label = document.createElement('div');

    Object.values(geoplace).forEach (place => {
      uniqueLabels.add(place.locationName);
    });

    label.textContent = Array.from(uniqueLabels).join(', ');

    return label;
  }

  encodedScriptureUrl = function (bookId, chapter, verses, isJst) {
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

  extractGeoplaces = function () {
    const uniqueGeoplaces = {};
    const locationLinks = document.querySelectorAll("a[onclick^='showLocation']")

    for (const locationLink of locationLinks) {
      const parsedItems = locationLink.getAttribute('onclick').split(',');
      const key = `${parsedItems[2]},${parsedItems[3]}`;
      const value = {
        locationName: parsedItems[1].substring(1, parsedItems[1].length - 1),
        latitude: Number(parsedItems[2]),
        longitude: Number(parsedItems[3]),
        viewAltitude: Number(parsedItems[8])
      };

      if (uniqueGeoplaces[key] !== undefined) {
        uniqueGeoplaces[key].push(value);
      } else {
        uniqueGeoplaces[key] = [value];
      }
    }

    return uniqueGeoplaces;
  };

  findNextChapter = function (bookId, newChapter) {
    if (newChapter > books[bookId].numChapters || newChapter < 0) {
      return `#${books[bookId].parentBookId}:${books[bookId].id}`;
    } else {
      return `#${books[bookId].parentBookId}:${bookId}:${newChapter}`;
    }
  }

  getScripturesFaliure = function () {
    document.getElementById(DIV_SCRIPTURES).innerHTML = 'Unable to retrieve chapter contents';
  };

  getScripturesSuccess = function (chapterHtml) {
    document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;
    updateMarkers(extractGeoplaces());
  };

  navigateBook = function (bookId) {
    document.getElementById('crumbs').innerHTML = `<a href="#">${volumes[books[bookId].parentBookId - 1].fullName}</a>`
      + `<span class="material-icons">chevron_right</span>`
      + `<a href="#${books[bookId].parentBookId}:${bookId}">${books[bookId].fullName}</a>`;

    document.getElementById('scriptures').innerHTML = `<div id='scripnav'>${booksGridContent(bookId)}</div>`;
  };

  navigateChapter = function (bookId, chapter) {
    renderNavigationArrows(bookId, chapter);
    ajax(encodedScriptureUrl(bookId, chapter), getScripturesSuccess, getScripturesFaliure, true);
  };

  navigateHome = function (volumeId) {
    document.getElementById('crumbs').innerHTML = `<a href="#">Home</a>`;
    document.getElementById('scriptures').innerHTML = `<div id='scripnav'>${volumesGridContent(volumeId)}</div>`;
  };

  renderNavigationArrows = function (bookId, chapter) {
    document.getElementById('crumbs').innerHTML = `<a href="#">${volumes[books[bookId].parentBookId - 1].fullName}</a>`
      + `<span class="material-icons">chevron_right</span>`
      + `<a href="#${books[bookId].parentBookId}:${bookId}">${books[bookId].fullName}</a>`
      + `<span class="material-icons">chevron_right</span>`
      + `<a href="#${books[bookId].parentBookId}:${bookId}:${chapter}">${chapter}</a>`;
    
    document.getElementById('chapterNavigation').innerHTML = `<a href='${findNextChapter(bookId, chapter - 1)}'>`
      + `<span id='navIconLeft' class="material-icons">arrow_back</span>`
      + `</a>`
      + `<a href='${findNextChapter(bookId, chapter + 1)}'>`
      + `<span id='navIconRight' class="material-icons">arrow_forward</span>`
      + `</a>`;
  };

  updateMarkers = function (geoplaces) {

    if (!mapIsLoaded) {
      window.setTimeout(function () {
        updateMarkers(geoplaces);
      }, 500);

      return;
    }

    clearMapPins();

    const bounds = new google.maps.LatLngBounds();

    Object.values(geoplaces).forEach (geoplace => {
      const marker = new markerWithLabel.MarkerWithLabel({
        position: new google.maps.LatLng(geoplace[0].latitude, geoplace[0].longitude),
        clickable: false,
        draggable: false,
        map,
        labelContent: createLabel(geoplace),
        labelAnchor: new google.maps.Point(-21, 3),
        labelClass: "labels",
        labelStyle: { opacity: 1.0 }
      });

      bounds.extend(marker.getPosition());

      mapMarkers.push(marker);
    });

    if (mapMarkers.length > 0) {
      map.fitBounds(bounds);
    } else {
      //Pan to jerusalem if no markers are present
      map.panTo(new google.maps.LatLng(31.7, 35.2));
      map.setZoom(8);
    }
  };

  volumesGridContent = function (volumeId) {
    let gridContent = '';

    volumes.forEach (volume => {
      if (volumeId === undefined || volumeId === volume.id) {
        gridContent += `<div class='volume'>${volumeTitle(volume)}</div>`;
        gridContent += booksGrid(volume);
      }
    });

    return gridContent;
  };

  volumeTitle = function (volume) {
    existingHref = `#${volume.id}`
    return `<a href='${existingHref}'><h1>${volume.fullName}</h1></a>`;
  };

  //public API----------------------------------------------------------------------

  init = function (callback) {
    let booksLoaded = false;
    let volumesLoaded = false;

    ajax(URL_BOOKS, function (data) {
        books = data;
        booksLoaded = true;

        if (volumesLoaded) {
          cacheBooks(callback);
        }
      }
    );

    ajax(URL_VOLUMES, function (data) {
        volumes = data;
        volumesLoaded = true;

        if (booksLoaded) {
          cacheBooks(callback);
        }
      }
    );
  };

  onHashChanged = function (event) {
    let ids = [];
    let volumeId;

    if (location.hash !== '' && location.hash.length > 1) {
      ids = location.hash.slice(1).split(':'); //slice up the hash to get an array of ids
    }

    if (ids.length <= 0) {
      navigateHome(); //if no ids are present, show the home view
    } else if (ids.length === 1) {
      volumeId = Number(ids[0]);

      if (volumes.map((volume) => volume.id).includes(volumeId)) {
        navigateHome(volumeId);
      } else {
        navigateHome();
      }
    } else {
      const bookId = Number(ids[1]);

      if (books[bookId] === undefined) {
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

  return {
    init,
    onHashChanged
  };
}() );
