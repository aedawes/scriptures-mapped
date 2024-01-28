const scriptures = ( function () {
  "use strict";

  //constants-----------------------------------------------------------------------

  //private variables---------------------------------------------------------------
  let books;
  let volumes;

  //private method declarations-----------------------------------------------------
  let ajax;
  let init;
  let cacheBooks;

  //private methods-----------------------------------------------------------------
  ajax = function (url, successCallback, failureCallback) {
    let request = new XMLHttpRequest();
    request.open( "GET", url, true );
    request.onload = function () {
      if ( this.status >= 200 && this.status < 400 ) {
        // Success!
        let data = JSON.parse( this.response );

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

  init = function (callback) {
    let booksLoaded = false;
    let volumesLoaded = false;

    cacheBooks = function (callback) {
      volumes.forEach( volume => {
        let volumeBooks = [];
        let bookId = volume.minBookId;

        while (bookId <= volume.maxBookId) {
          volumeBooks.push(books[bookId]);
          bookId++;
        }

        volume.books = volumeBooks;
      });

      if(typeof callback === "function") {
        callback();
      }
    };

    ajax( "https://scriptures.byu.edu/mapscrip/model/books.php",
      data => {
        books = data;
        booksLoaded = true;

        if(volumesLoaded) {
          cacheBooks(callback);
        }
      }
    );
    ajax( "https://scriptures.byu.edu/mapscrip/model/volumes.php",
      data => {
        volumes = data;
        volumesLoaded = true;

        if(volumesLoaded) {
          cacheBooks(callback);
        }
      }
    );
  };

  //public api-----------------------------------------------------------------------

  return {
    init: init
  };
}() );
