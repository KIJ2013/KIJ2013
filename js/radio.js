(function(KIJ2013,$){
    var loaded = false,
        player,
        url = 'http://176.227.210.187:8046/;stream=1',

    init = function(){
        if(!loaded)
        {
            player = $('#player').jPlayer({
                cssSelectorAncestor: "#controls",
                nativeSupport: true,
                ready: function(){
                    player.jPlayer("setMedia", {mp3:url}).jPlayer('play');
                },
                swfPath: 'swf',
                volume: 60,
                errorAlerts: true
            });
            loaded = true;
        }
        KIJ2013.setTitle('Radio');
    };

    KIJ2013.Modules.Radio = {
        init: init
    };

}(KIJ2013,jQuery));
