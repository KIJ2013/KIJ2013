var KIJ2013 = function(){
    
    return {
        db: null,
        init: function(){
            if(!window.openDatabase)
            {
                $('#body').html('<p>Sorry Support for your device is not ready yet. Please try again in the future.</p>');
                return;
            }
            this.db = window.openDatabase("KIJ2013", "1.0", "KIJ2013 Database", 256*1024);
        },
        setActionBarUp: function(fn)
        {
            if(typeof fn == "function")
            {
                $('#up-button').removeAttr('href');
                $('#up-button').unbind();
                $('#up-button').click(function(){
                    fn();
                    return false;
                });
            }
            else if(typeof fn == "string")
            {
                $('#up-button').unbind();
                $('#up-button').attr('href', fn);
            }
        },
        setActionBarTitle: function(title)
        {
            $('#action_bar h1').text(title);
        },
        showError: function(message)
        {
            $('#popup').text(message);
            $('#popup').show();
            setTimeout(function(){
                $('#popup').slideUp('normal')
            },5000);
        }
    }
}();
