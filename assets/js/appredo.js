/**
 *Version 1
 *author: Alejandro Crespo 
 *improved: 
 *-Memory improvement, reduce of the drawing objects.
 */
function getRealContentHeight() {
    var viewport_height = $(window).height();
    var content_height = viewport_height;
    return content_height;
}
var contents = "";
var oldContent = "";
var f, geoXml;
var markers = [];
var opened = false;
var url = "";
function setFile(evt) {
    geoXml = new geoXML3.parser({
        map: map
    });
    url = evt;
    readSingleFile();
}
function addMyMarker(placemark) {
    var marker = geoXml.createMarker(placemark);
    
    markers.push(marker);
}
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
function readSingleFile() {
    geoXml = geoXML3.parser({
        map: null
    });
    setMapOnAll(null);
    $.ajax({
        url: url,
        async: true,
        cache: false,
        dataType: "text",
        success: function(data, textStatus, jqXHR) {
            var resourceContent = data;
            geoXml = geoXML3.parser({
                map: map,
                createMarker: addMyMarker,
                suppressInfoWindows: true
            });
            geoXml.parseKmlString(data);
        }
    });
}
var map, marker;
function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(0, 0),
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });
    //resize();
    setFile();
}
function resize() {
    $("body").height(getRealContentHeight());
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
}
/*google.maps.event.addDomListener(window, 'load', initialize);
google.maps.event.addDomListener(window, "resize", resize);*/