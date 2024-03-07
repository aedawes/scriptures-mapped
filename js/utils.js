function renderNavigationArrows(bookId, chapter) {
  const content = `<a href="#">${window.volumes[window.books[bookId].parentBookId - 1].fullName}</a>`
    + `<span class="material-icons">chevron_right</span>`
    + `<a href="#${window.books[bookId].parentBookId}:${bookId}">${window.books[bookId].fullName}</a>`
    + `<span class="material-icons">chevron_right</span>`
    + `<a href="#${window.books[bookId].parentBookId}:${bookId}:${chapter}">${chapter}</a>`;

  document.getElementById('crumbs').innerHTML = content;
  document.querySelector('#content #crumbs').innerHTML = content;
  
  const leftArrow = `<a id='navIconLeft' href='${findNextChapter(bookId, chapter - 1)}'>
      <span class="material-icons">arrow_back</span>
      </a>`

  const rightArrow = `<a id='navIconRight' href='${findNextChapter(bookId, chapter + 1)}'>
    <span class="material-icons">arrow_forward</span>
    </a>`;

  const navHeading = document.getElementsByClassName('navheading');
  navHeading[0].innerHTML = `${leftArrow}${navHeading[0].innerHTML}${rightArrow}`
};

function extractGeoplaces() {
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

function findNextChapter(bookId, newChapter) {
  if (newChapter > window.books[bookId].numChapters || newChapter < 0) {
    return `#${window.books[bookId].parentBookId}:${window.books[bookId].id}`;
  } else {
    return `#${window.books[bookId].parentBookId}:${bookId}:${newChapter}`;
  }
}

export { renderNavigationArrows, extractGeoplaces };

