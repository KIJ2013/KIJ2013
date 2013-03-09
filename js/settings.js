(function(KIJ2013, $, Lawnchair){

    /**
     * PRIVATE Variables
     */
    var subcamp_el,
        initialised = false,

    init = function() {
        if(!initialised){
            subcamp_el = $('#subcamp');
            var subcamps = KIJ2013.getSetting('subcamps',[]),
                subcamp = KIJ2013.getPreference('subcamp'),
                i = 0,
                l = subcamps.length,
                name, opt;
            $('<option>').appendTo(subcamp_el);
            for(;i<l;i++){
                name = subcamps[i];
                opt = $('<option>').val(name).text(name).appendTo(subcamp_el);
                if(name == subcamp)
                    opt.attr('selected',true);
            }
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
