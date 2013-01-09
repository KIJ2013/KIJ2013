KIJ2013.Map = function(){
    var img_bounds = [0.5785846710205073,51.299361979488744,0.5925965309143088,
        51.305519711648124],
        img_size = [2516,1867],
        xScale = img_size[0]/(img_bounds[2]-img_bounds[0]),
        yScale = img_size[1]/(img_bounds[3]-img_bounds[1]),
        img,
        marker,
        initialised=false,

        lonToX = function(lon){
            if(lon<img_bounds[0])
                throw "OutOfBounds";
            if(lon>img_bounds[2])
                throw "OutOfBounds";
            return (lon-img_bounds[0])*xScale;
        },

        latToY = function(lat){
            if(lat<img_bounds[1])
                throw "OutOfBounds";
            if(lat>img_bounds[3])
                throw "OutOfBounds";
            return (lat-img_bounds[1])*yScale;
        };
    return {
        init: function(){
            var gl = navigator.geolocation;
            if(!initialised){
                img = $('#map img');
                if(img.length == 0)
                {
                    KIJ2013.showLoading();
                    img = $('<img />').attr('src', "img/map.png")
                        .appendTo('#map').load(
                        function(){
                            KIJ2013.Map.moveTo(51.3015, 0.584);
                            KIJ2013.hideLoading();
                        });
                }
                marker = $('#marker');
                initialised = true;
            }
            else
                KIJ2013.Map.moveTo(51.3015, 0.584);
            if(gl)
            {
                gl.getCurrentPosition(function(position){
                    var coords = position.coords,
                        lat = coords.latitude,
                        lon = coords.longitude;
                    KIJ2013.Map.mark(lat, lon);
                    setTimeout(function(){KIJ2013.Map.moveTo(lat, lon)},2);
                }, function(){KIJ2013.showError('Error Finding Location')});
            }
        },
        moveTo: function(lat, lon)
        {
            try {
                var win = $(window),
                    height = win.height(),
                    width = win.width(),
                    x = lonToX(lon) - width / 2,
                    y = img_size[1] - latToY(lat) - height / 2;
                setTimeout(function(){window.scrollTo(x, y);},10);
            }
            catch (e){}
        },
        mark: function(lat, lon)
        {
            try {
                marker.css({display: 'block', bottom: latToY(lat),
                    left: lonToX(lon)});
            }
            catch (e){}
        },
        unmark: function(){
            marker.css({display: 'none'});
        }
    }
}();
