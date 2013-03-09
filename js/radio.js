(function(KIJ2013,$){
    var loaded = false,
        player,
        settings = {},

    init = function(){
        settings = KIJ2013.getModuleSettings('Radio');
        player = $('#player').jPlayer({
            cssSelectorAncestor: "#controls",
            nativeSupport: true,
            ready: function(){
                player.jPlayer("setMedia", {mp3:settings.streamURL});
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
