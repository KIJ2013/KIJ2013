(function(KIJ2013, $, Lawnchair){

    /**
     * PRIVATE Variables
     */
    var subcamp_el,
        initialised = false,

    init = function() {
        if(!initialised){
            subcamp_el = $('#subcamp');
            subcamp_el.val(KIJ2013.getPreference('subcamp'))
            subcamp_el.change(function(){
                var val = subcamp_el.val();
                KIJ2013.setPreference("subcamp", val);
            });
            $('#clear-cache').click(function(){
                KIJ2013.clearCaches(function(){alert('Cache Cleared');});
            });
            $('#clear-preferences').click(function(){
                KIJ2013.clearPreferences(function(){
                    subcamp_el.val('');
                    alert("Preferences Cleared");
                });
            });
            initialised = true;
        }
    }

    KIJ2013.Modules.Settings = {
        init: init
    };

}(KIJ2013, jQuery, Lawnchair));
