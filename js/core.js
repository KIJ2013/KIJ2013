var KIJ2013 = (function(window, $, Lawnchair){
    var store_name = "core",
        preferences_key = "preferences",
        settings_key = "settings",
        default_settings_url = "settings.json",
        loading,
        beingLoaded,
        popup,
        store,
        modules = {},

        /**
         * Initialise KIJ2013 objects, databases and preferences
         */
        init = function(){
            var firstModule,
                afterDB = function(){
                    var select = $('#action_bar select'), m;
                    select.empty();
                    for(module in modules){
                        if(!firstModule)
                            firstModule = module;
                        $("<option>").text(KIJ2013.Util.ucfirst(module)).appendTo(select);
                        m = modules[module];
                        (typeof m.init == "function") && m.init();
                    }
                    select.change(function(){
                        navigateTo(select.val());
                    });
                };

            // Load preferences from store
            store = Lawnchair({name: store_name}, function(){
                var both = false;
                this.get(preferences_key, function(pref){
                    if(pref)
                        preferences = pref;

                    both && afterDB();
                    both = true;
                });
                this.get(settings_key, function(sett){
                    if(sett)
                        settings = sett;

                    loadSettings();

                    both && afterDB();
                    both = true;
                });
            });

            setActionBarUp();
            popup = $('#popup');
            loading = $('#loading');
            setTimeout(function() {window.scrollTo(0, 1);}, 0);
            setTimeout(function(){
                $('#action_bar').show();
                navigateTo(firstModule);
            },1000);
        },

        /**
         * Load settings from configured source
         */
        loadSettings = function(){
            var urls = settings.settingsURL.push ?
                    settings.settingsURL.slice() : [settings.settingsURL];
            urls.push(default_settings_url);
            KIJ2013.Util.loadFirst(urls, function(json){
                json.key = settings_key;
                settings = json;
                store.save(settings);
            });
        },

        defaultSettings = function(){
            return {key: settings_key, settingsURL: default_settings_url};
        },
        settings = defaultSettings(),

        defaultPreferences = function(){
            return {key: preferences_key};
        },
        preferences = defaultPreferences(),

        getSetting = function(name, def){
            return settings[name] || def || null;
        },

        getModuleSettings = function(name){
            return (settings.modules && settings.modules[name]) || {};
        },

        getPreference = function(name, def){
            return preferences[name] || def || null;
        },

        setPreference = function(name, value)
        {
            // Do not allow overriding key
            if(name == "key"){ return; }

            preferences[name] = value;
            store.save(preferences);
        },

        clearPreferences = function(callback){
            preferences = defaultPreferences();
            store.save(preferences, callback);
        },

        clearCaches = function(callback){
            settings = defaultSettings();
            store.save(settings, callback);
            loadSettings();

            // Callback should be delayed until modules have finished clearing
            for(module in modules){
                if(modules[module].clearCache)
                    modules[module].clearCache();
            }
        },

        navigateTo = function(name) {
            var sections = $('section:visible'),
                nm;
            $.each(sections, function(i,item){
                nm = KIJ2013.Util.ucfirst($(item).attr('id'));
                if(modules[nm] && typeof modules[nm].hide == "function")
                    modules[nm].hide();
            })
            sections.hide();
            $('#'+name.toLowerCase()).show();
            setTitle(name);
            if(modules[name] && typeof modules[name].show == "function")
                modules[name].show();
            scrollTop();
        },

        setActionBarUp = function(fn)
        {
            if(typeof fn == "function")
            {
                $('#up-button').removeAttr('href').unbind().click(function(){
                    fn();
                    return false;
                });
                $('#up-icon').css({'visibility': 'visible'});
            }
            else if(typeof fn == "string")
            {
                $('#up-button').unbind().click(function(){
                    navigateTo(fn);
                    return false;
                });
                $('#up-icon').css('visibility', 'visible');
            }
            else if(typeof fn == "undefined")
                $('#up-icon').css('visibility', 'hidden');
        },

        setTitle = function(title)
        {
            var blank = typeof title == "undefined" || title == "",
                default_title = "KIJ2013";
            $('title').text(blank ? default_title : default_title + " - " + title);
            $('#action_bar h1').text(blank ? default_title : title);
        },

        showLoading = function()
        {
            if(loading.length == 0)
            {
                loading = $('<div/>').attr('id', 'loading')
                    .text("Loading").append(
                        $('<img/>').attr('src',"img/ajax-loader.gif"))
                    .appendTo('#body');
            }
            beingLoaded = $('section:visible').hide();
            loading.show();
        },

        hideLoading = function(){
            if(loading)
                loading.hide();
            if(beingLoaded){
                beingLoaded.show();
                beingLoaded = null;
            }
        },

        showError = function(message)
        {
            if(popup.length == 0)
            {
                popup = $('<div/>').attr('id', 'popup').appendTo('body');
            }
            popup.text(message).show();
            setTimeout(function(){
                popup.slideUp('normal')
            },5000);
        },

        scrollTop = function(){
            window.scrollTo(0,1);
        };

    /*
     * Export public API functions
     */
    return {
        clearCaches: clearCaches,
        clearPreferences: clearPreferences,
        getModuleSettings: getModuleSettings,
        getPreference: getPreference,
        getSetting: getSetting,
        hideLoading: hideLoading,
        init: init,
        navigateTo: navigateTo,
        scrollTop: scrollTop,
        setActionBarUp: setActionBarUp,
        setPreference: setPreference,
        setTitle: setTitle,
        showError: showError,
        showLoading: showLoading,
        Modules: modules
    };

}(window,jQuery,Lawnchair));
$(function(){
    KIJ2013.init();
});
(function(){
    var randomColor = function(min,max){
            if(arguments.length < 2)
                max = 255;
            if(arguments.length < 1)
                min = 0;
            return "rgb("+((max-min)*Math.random()+min).toFixed()+","+
                ((max-min)*Math.random()+min).toFixed()+","+
                ((max-min)*Math.random()+min).toFixed()+")";
        },

        filter = function(field, value, condition, primer){
            var key = function (x) {return primer ? primer(x[field]) : x[field]};
            value = arguments.length == 2 ? arguments[1] : arguments[2];
            condition = arguments.length == 2 ? "=" : arguments[1];
            return function (a) {
                var A = key(a);
                return condition == "=" ? A == value :
                    (condition == ">" ? A > value :
                        (condition == "<" ? A < value : true)
                    );
            }
        },

        sort = function(field, reverse, primer){
            var key = function (x) {return primer ? primer(x[field]) : x[field]};
            reverse = typeof reverse == "undefined" || reverse;
            return function (a,b) {
                var A = key(a), B = key(b);
                return (A < B ? -1 : (A > B ? +1 : 0)) * [-1,1][+!!reverse];
            }
        },

        merge = function(/* variable number of arrays */){
            var out = [], array, count, len, i, j;
            for(i = 0, count = arguments.length; i < count; i++){
                array = arguments[i];
                for(j = 0, len = array.length; j < len; j++){
                    if(out.indexOf(array[j]) === -1) {
                        out.push(array[j]);
                    }
                }
            }
            return out;
        },

        ucfirst = function(string){
            return string.slice(0,1).toUpperCase() + string.slice(1)
        },

        /**
         * Load each URL in turn until one succeeds
         * @param string[] urls Array of urls to try
         * @param function callback Function to be called once successful
         * @param string type Expected dataType, defaults to 'json'
         */
        loadFirst = function(urls, callback, type){
            if(!urls)
                return;

            var l = urls.length,
                f = function(i){
                    return $.ajax({
                        url: urls[i]+"?"+(Math.random()*10000).toFixed(),
                        dataType: type || 'json',
                        success: callback,
                        error: function(){
                            if(i<l-1){
                                f(i+1);
                            }
                        }
                    });
                };
            return f(0);
        };

    KIJ2013.Util = {
        randomColor: randomColor,
        filter: filter,
        sort: sort,
        merge: merge,
        ucfirst: ucfirst,
        loadFirst: loadFirst
    };
}());
