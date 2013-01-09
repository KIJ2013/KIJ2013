KIJ2013.Settings = function(){

    /**
     * PRIVATE Variables
     */
    var TABLE_NEWS = "news",
        TABLE_EVENTS = "events",
        TABLE_LEARN = "learn",
        TABLE_PREFS = "preferences",
        subcamp_el,
        initialised = false;

    return {
        init: function() {
            if(!initialised){
                subcamp_el = $('#subcamp');
                subcamp_el.val(KIJ2013.getPreference('subcamp'))
                subcamp_el.change(function(){
                    var val = subcamp_el.val();
                    KIJ2013.setPreference("subcamp", val);
                });
                $('#clear-cache').click(function(){
                    var all_done = 0;
                    Lawnchair({name: TABLE_NEWS}, function(){
                        this.nuke();
                        if(++all_done == 3)
                            alert("Cache Cleared");
                    });
                    Lawnchair({name: TABLE_EVENTS}, function(){
                        this.nuke();
                        if(++all_done == 3)
                            alert("Cache Cleared");
                    });
                    Lawnchair({name: TABLE_LEARN}, function(){
                        this.nuke();
                        if(++all_done == 3)
                            alert("Cache Cleared");
                    });
                });
                $('#clear-preferences').click(function(){
                    Lawnchair({name: TABLE_PREFS}, function(){
                        this.nuke();
                        subcamp_el.val('');
                        alert("Preferences Cleared");
                    });
                });
                initialised = true;
            }
        }
    }
}();
