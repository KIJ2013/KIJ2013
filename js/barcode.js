KIJ2013.Barcode = (function(KIJ2013,win,nav){
    var video = $('#live')[0],
        canvas = $('<canvas>')[0],
        ctx = canvas.getContext('2d'),
        localMediaStream = null,
        qr = typeof qrcode !== "undefined" ? qrcode : false,
        snapshot = function (){
            if(localMediaStream && qr){
                ctx.drawImage(video,0,0);
                qr.decode(canvas.toDataURL('image/webp'));
            }
        },
        createObjectURL,
        interval,
        initialised,
        self = {};
    canvas.width = 640;
    canvas.height = 480;
    // Normalise getUserMedia
    nav.getUserMedia ||
        (nav.getUserMedia = nav.webkitGetUserMedia);
    // Normalise window URL
    win.URL ||
        (win.URL = win.webkitURL || win.msURL || win.oURL);
    // Avoid opera quirk
    createObjectURL = function(stream){
        return (win.URL && win.URL.createObjectURL) ?
            win.URL.createObjectURL(stream) : stream;
    };
    if(qr){
        // Set callback for detection of QR Code
        qr.callback = function (a)
        {
            if(a){
                var id = a.slice(26);
                if(a.slice(0,26) == "http://kij13.org.uk/learn/")
                {
                    KIJ2013.Barcode.stop();
                    KIJ2013.Learn.add(id);
                    alert("Congratulations you found an item.");
                    KIJ2013.navigateTo('Learn');
                    KIJ2013.Learn.highlight(id);
                }
                else
                    alert(a);
            }
        };
    }

    self.init = function(){
        if(nav.getUserMedia){
            if(!initialised){
                nav.getUserMedia({video:true},
                    function(stream) {
                        // Display Preview
                        video.src = createObjectURL(stream);
                        // Keep reference to stream for snapshots
                        localMediaStream = stream;
                        initialised = true;
                        KIJ2013.Barcode.start();
                    },
                    function(err) {
                        console.log("Unable to get video stream!")
                    }
                );
            }
            else
                KIJ2013.Barcode.start();
        }
        else
            KIJ2013.showError('Barcode Scanner is not available on your '
                + 'platform.')
    };

    self.start = function(){
        video.play();
        if(interval)
            clearInterval(interval);
        interval = setInterval(snapshot, 1000);
    };

    self.stop = function(){
        video.pause();
        clearInterval(interval);
    };

    self.hide = function(){
        KIJ2013.Barcode.stop();
    };

    return self;
}(KIJ2013,window,navigator));
