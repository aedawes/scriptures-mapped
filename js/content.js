let existingHref;

function bookChapterValid(bookId, chapter) {
  const book = window.books[bookId];

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

function booksGrid(volume) {
  let gridContent = `<div class='books'>`;

  volume.books.forEach (book => {
    gridContent += `<a id='${book.id}' href='#${volume.id}:${book.id}'>${book.gridName}</a>`;
  });

  return `${gridContent}</div>`;
};

function booksGridContent(bookId) {
  let gridContent = '';

  for (let book in window.books) {
    if (bookId === undefined || bookId === window.books[book].id) {
      gridContent += `<div class='volume'>${bookTitle(window.books[book])}</div>`;
      gridContent += chapterGrid(window.books[book]);
    }
  }

  return gridContent;
};

function bookTitle(book){
  return `<a href='${existingHref}:${book.id}'><h1>${book.fullName}</h1></a>`;
};

function cacheBooks(callback) {
   window.volumes.forEach (function (volume) {
    let volumeBooks = [];
    let bookId = volume.minBookId;
    
    while (bookId <= volume.maxBookId) {
      volumeBooks.push(window.books[bookId]);
      bookId++;
    }
    
    volume.books = volumeBooks;
  });
  
  if (typeof callback === "function") {
    callback();
  }
};

function chapterGrid(book) {
  let gridContent = `<div class='books'>`;

  for (let i = 1; i <= book.numChapters; i++) {
    gridContent += `<a class='chapter' id='${i}' href='#${book.parentBookId}:${book.id}:${i}'>${i}</a>`;
  }
  return `${gridContent}</div>`;
}

function volumesGridContent(volumeId) {
  let gridContent = '';

   window.volumes.forEach (volume => {
    if (volumeId === undefined || volumeId === volume.id) {
      gridContent += `<div class='volume'>${volumeTitle(volume)}</div>`;
      gridContent += booksGrid(volume);
    }
  });

  return gridContent;
};

function volumeTitle(volume) {
  existingHref = `#${volume.id}`
  return `<a href='${existingHref}'><h1>${volume.fullName}</h1></a>`;
};

export { bookChapterValid, booksGridContent, cacheBooks, volumesGridContent };