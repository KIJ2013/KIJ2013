(function(KIJ2013,$){
    var loaded = false,
        player,
        url = 'http://176.227.210.187:8046/;stream=1',

    init = function(){
        player = $('#player').jPlayer({
            cssSelectorAncestor: "#controls",
            nativeSupport: true,
            ready: function(){
                player.jPlayer("setMedia", {mp3:url});
                loaded = true;
            },
            swfPath: 'swf',
            volume: 60,
            errorAlerts: true
        });
    },

    show = function(){
        KIJ2013.setTitle('Radio');
        if(loaded)
            player.jPlayer('play');
    };

    KIJ2013.Modules.Radio = {
        init: init,
        show: show
    };

}(KIJ2013,jQuery));
