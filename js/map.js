KIJ2013.Map = function(){
    var img_bounds = [0.5785846710205073,51.299361979488744,0.5925965309143088,
        51.305519711648124],
        img_size = [2516,1867],
        xScale = img_size[0]/(img_bounds[2]-img_bounds[0]),
        yScale = img_size[1]/(img_bounds[3]-img_bounds[1]),
        lonToX = function(lon){
            if(lon<img_bounds[0])
                return 0;
            if(lon>img_bounds[2])
                return img_size[0];
            return (lon-img_bounds[0])*xScale;
        },
        latToY = function(lat){
            if(lat<img_bounds[1])
                return 0;
            if(lat>img_bounds[3])
                return img_size[1];
            return (lat-img_bounds[1])*yScale;
        },
        marker;
    return {
        init: function(){
            marker = $('#marker');
            setTimeout(function(){KIJ2013.Map.moveTo(51.3, 0.585)},1);
            KIJ2013.Map.mark(51.3, 0.585);
        },
        moveTo: function(lat, lon)
        {
            window.scrollTo(lonToX(lon), latToY(lat));
        },
        mark: function(lat, lon)
        {
            marker.css({display: 'block', left: lonToX(lon), top: latToY(lat)});
        },
        unmark: function(){
            marker.css({display: 'none'});
        }
    }
}();
$(KIJ2013.Map.init);
