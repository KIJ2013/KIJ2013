(function(KIJ2013,win,nav){
    var video = $('#live')[0],
        canvas = $('<canvas>')[0],
        ctx = canvas.getContext('2d'),
        localMediaStream = null,
        qr = typeof qrcode !== "undefined" ? qrcode : false,
        interval,
        initialised,
        settings = {},

    init = function(){
        settings = KIJ2013.getModuleSettings('Barcode');
        canvas.width = 640;
        canvas.height = 480;
        // Normalise getUserMedia
        nav.getUserMedia ||
            (nav.getUserMedia = nav.webkitGetUserMedia);
        // Normalise window URL
        win.URL ||
            (win.URL = win.webkitURL || win.msURL || win.oURL);
        if(!nav.getUserMedia)
            KIJ2013.showError('Barcode Scanner is not available on your '
                + 'platform.')
    },

    // Avoid opera quirk
    createObjectURL = function(stream){
        return (win.URL && win.URL.createObjectURL) ?
            win.URL.createObjectURL(stream) : stream;
    },

    snapshot = function (){
        if(localMediaStream && qr){
            ctx.drawImage(video,0,0);
            qr.decode(canvas.toDataURL('image/webp'));
        }
    },

    start = function(){
        video.play();
        if(interval)
            clearInterval(interval);
        interval = setInterval(snapshot, 1000);
    },

    stop = function(){
        video.pause();
        clearInterval(interval);
    },

    show = function() {
        if(!initialised){
            nav.getUserMedia({video:true},
                function(stream) {
                    // Display Preview
                    video.src = createObjectURL(stream);
                    // Keep reference to stream for snapshots
                    localMediaStream = stream;
                    initialised = true;
                    start();
                },
                function(err) {
                    console.log("Unable to get video stream!")
                }
            );
        }
    },

    hide = function(){
        stop();
    };

    if(qr){
        // Set callback for detection of QR Code
        qr.callback = function (a)
        {
            if(a){
                var prefix = settings.urlPrefix,
                    length = prefix.length,
                    id = a.slice(length);
                if(a.slice(0,length) == prefix)
                {
                    stop();
                    KIJ2013.Modules.Learn.add(id);
                    alert("Congratulations you found an item.");
                    KIJ2013.navigateTo('Learn');
                    KIJ2013.Modules.Learn.highlight(id);
                }
                else
                    alert(a);
            }
        };
    };

    KIJ2013.Modules.Barcode = {
        init: init,
        show: show,
        start: start,
        stop: stop,
        hide: hide
    };

}(KIJ2013,window,navigator));
