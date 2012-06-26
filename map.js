KIJ2013.Map = function(){
    return {
        map: null,
        init: function(){
            KIJ2013.init();
            KIJ2013.showLoading();
            var bounds = new L.LatLngBounds(
                      new L.LatLng(51.299361979488744,0.5785846710205073),
                      new L.LatLng(51.305519711648124,0.5925965309143088)),
                layer = new L.ImageOverlay("map.png", bounds),
                map = KIJ2013.Map.map = new L.Map('body', {
                minZoom: 16,
                maxZoom: 18,
                maxBounds: bounds
            });
            map.addLayer(layer);
            map.setView(new L.LatLng(51.302,0.585),17);
            map.locate();
            map.on('locationfound', function(e) {
                var radius = e.accuracy / 2;
                if(bounds.contains(e.latlng)){
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
