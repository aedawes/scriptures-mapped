const REQUEST_GET = "GET";
const REQUEST_STATUS_ERROR = 400;
const REQUEST_STATUS_OK = 200;

function ajax(url, successCallback, failureCallback, skipJsonParse) {
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

export { ajax };