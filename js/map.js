(function(KIJ2013,$,navigator){
    var xScale,
        yScale,
        img,
        marker,
        initialised=false,
        settings = {},

        init = function(){
            var s = settings = KIJ2013.getModuleSettings('Map');
            xScale = s.imageSize[0]/(s.imageBounds[2]-s.imageBounds[0]);
            yScale = s.imageSize[1]/(s.imageBounds[3]-s.imageBounds[1]);
        },

        lonToX = function(lon){
            if(lon<settings.imageBounds[0])
                throw "OutOfBounds";
            if(lon>settings.imageBounds[2])
                throw "OutOfBounds";
            return (lon-settings.imageBounds[0])*xScale;
        },

        latToY = function(lat){
            if(lat<settings.imageBounds[1])
                throw "OutOfBounds";
            if(lat>settings.imageBounds[3])
                throw "OutOfBounds";
            return (lat-settings.imageBounds[1])*yScale;
        },

        show = function(){
            var gl = navigator.geolocation;
            if(!initialised){
                img = $('#map img');
                if(img.length == 0)
                {
                    KIJ2013.showLoading();
                    img = $('<img />').attr('src', settings.imageURL)
                        .appendTo('#map').load(
                        function(){
                            moveTo(51.3015, 0.584);
                            KIJ2013.hideLoading();
                        });
                }
                marker = $('#marker');
                initialised = true;
            }
            else
                moveTo(51.3015, 0.584);
            if(gl)
            {
                gl.getCurrentPosition(function(position){
                    var coords = position.coords,
                        lat = coords.latitude,
                        lon = coords.longitude;
                    mark(lat, lon);
                    setTimeout(function(){moveTo(lat, lon)},2);
                }, function(){KIJ2013.showError('Error Finding Location')});
            }
        },

        moveTo = function(lat, lon)
        {
            try {
                var win = $(window),
                    height = win.height(),
                    width = win.width(),
                    x = lonToX(lon) - width / 2,
                    y = settings.imageSize[1] - latToY(lat) - height / 2;
                setTimeout(function(){window.scrollTo(x, y);},10);
            }
            catch (e){}
        },

        mark = function(lat, lon)
        {
            try {
                marker.css({display: 'block', bottom: latToY(lat),
                    left: lonToX(lon)});
            }
            catch (e){}
        },

        unmark = function(){
            marker.css({display: 'none'});
        };

    KIJ2013.Modules.Map =  {
        init: init,
        show: show,
        moveTo: moveTo,
        mark: mark,
        unmark: unmark
    };

}(KIJ2013,jQuery,navigator));
