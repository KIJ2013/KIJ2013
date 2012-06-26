KIJ2013.Map = function(){
    return {
        map: null,
        init: function(){
            KIJ2013.init();
            KIJ2013.showLoading();
            var bounds = [0.5785846710205073, 51.299361979488744,
                  0.5925965309143088, 51.305519711648124],
                llBounds = new L.LatLngBounds(
                      new L.LatLng(bounds[1],bounds[0]),
                      new L.LatLng(bounds[3],bounds[2])),
                minLon = bounds[0],
                minLat = bounds[1],
                maxLon = bounds[2],
                maxLat = bounds[3],
                layer = new L.ImageOverlay("map.png", llBounds);
            KIJ2013.Map.map = new L.Map('body', {
                zoomControl: false,
                maxBounds: llBounds
            });
            KIJ2013.Map.map.addLayer(layer);
            KIJ2013.Map.map.setView(new L.LatLng(51.302,0.585),17);
            KIJ2013.Map.map.locate();
            KIJ2013.Map.map.on('locationfound', function(e) {
                var lat = e.latlng.lat,
                    lon = e.latlng.lon,
                    radius = e.accuracy / 2;
                if(lat > minLat && lat < maxLat && lon > minLon && lon < maxLon){

                    var marker = new L.Marker(e.latlng);
                    KIJ2013.Map.map.addLayer(marker);
                    marker.bindPopup("You are within " + radius + " meters from this point").openPopup();

                    var circle = new L.Circle(e.latlng, radius);
                    KIJ2013.Map.map.addLayer(circle);
                }
            });
        }
    }
}();
$(KIJ2013.Map.init);
