let mapIsLoaded = window.mapIsLoaded;
let mapMarkers = [];

function clearMapPins() {
    mapMarkers.forEach (marker => {
      marker.setMap(null);
    });

    mapMarkers = [];
}

function createLabel(geoplace) {
    let uniqueLabels = new Set();

    //ChatGPT helped me with this function, specifically the label creation
    const label = document.createElement('div');

    Object.values(geoplace).forEach (place => {
      uniqueLabels.add(place.locationName);
    });

    label.textContent = Array.from(uniqueLabels).join(', ');

    return label;
}

function updateMarkers(geoplaces) {
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
}

export { updateMarkers };