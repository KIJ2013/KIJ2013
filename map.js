KIJ2013.Map = function(){
    return {
        init: function(){
            var bounds = [0.5785846710205073, 51.299361979488744,
                  0.5925965309143088, 51.305519711648124],
                minLon = bounds[0],
                minLat = bounds[1],
                maxLon = bounds[2],
                maxLat = bounds[3],
                map = new L.Map('map', {
                    zoomControl: false,
                    maxBounds: new L.LatLngBounds(
                      new L.LatLng(minLat,minLon),
                      new L.LatLng(maxLat,maxLon))
                }),
                layer = new L.TileLayer('map/{z}/{x}/{y}.png', {
                    minZoom: 17,
                    maxZoom: 17,
                    scheme: "tms"
                });
            map.addLayer(layer);
            map.setView(new L.LatLng(51.302,0.585),17);
            map.locate();
            map.on('locationfound', function(e) {
                var lat = e.latlng.lat,
                    lon = e.latlng.lon,
                    radius = e.accuracy / 2;
                if(lat > minLat && lat < maxLat && lon > minLon && lon < maxLon){

                    var marker = new L.Marker(e.latlng);
                    map.addLayer(marker);
                    marker.bindPopup("You are within " + radius + " meters from this point").openPopup();

                    var circle = new L.Circle(e.latlng, radius);
                    map.addLayer(circle);
                }
            });
        }
    }
}();
$(KIJ2013.Map.init);
