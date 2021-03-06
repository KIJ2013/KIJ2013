var KIJ2013 = (function(window, $, Lawnchair){
    var store_name = "core",
        preferences_key = "preferences",
        settings_key = "settings",
        default_settings_url = "settings.json",
        loading,
        beingLoaded,
        spinner,
        actions,
        title,
        popup,
        store,
        modules = {},
        events = $({}),

        /**
         * Initialise KIJ2013 objects, databases and preferences
         */
        init = function(){

            spinner = $('#spinner');
            actions = $('#actions');
            title = $('#title').hide();
            popup = $('#popup');
            loading = $('#loading');

            var firstModule;

            spinner.change(function(){
                navigateTo(spinner.val());
            });

            actions.change(function(){
                fireAction(actions.val());
            });

            events.bind('contentready', function(){
                console.log('contentready');
                setActionBarUp();
                $('#action_bar').show();
                navigateTo(firstModule);
                setTimeout(function() {window.scrollTo(0, 1);}, 0);
            });

            events.bind('databaseready', function(){
                console.log('databaseready');

                // Load Modules
                var m, trigger = false;
                for(module in modules){
                    m = modules[module];
                    (typeof m.init == "function") && m.init();
                    if(!firstModule){
                        firstModule = module;
                        if(m.contentready){
                            m.contentready(function(){events.trigger('contentready')});
                        }
                        else {
                            trigger = true;
                        }
                        (typeof m.show == "function") && m.show();
                    }
                }

                // Add our own About action
                addActionItem('About');

                // If first module does not support contentready event
                // we need to fire it now
                if(trigger) {
                    events.trigger('contentready');
                }
            });

            store = Lawnchair({name: store_name}, function(){
                var prefReady = false,
                    settReady = false,
                    databaseReady = false;

                // Load preferences from store
                this.get(preferences_key, function(pref){
                    if(pref)
                        preferences = pref;

                    if(settReady && !databaseReady){
                        events.trigger('databaseready');
                        databaseReady = true;
                    }
                    prefReady = true;
                });

                events.bind('settingsload', function(){
                    console.log('settingsload');
                    if(prefReady && !databaseReady){
                        events.trigger('databaseready');
                        databaseReady = true;
                    }
                    settReady = true;
                });

                // Load settings from store
                this.get(settings_key, function(sett){
                    if(sett){
                        settings = sett;
                        events.trigger('settingsload');
                    }
                    loadSettings();
                });
            });
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
                if(store)
                    store.save(settings);
                else
                    console.log("Error: Store not available to save settings");
                events.trigger('settingsload');
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
            hideSections();
            showSection(name);
        },

        fireAction = function(name) {
            hideSections();
            actions[0].selectedIndex = 0;
            showSection(name);
            spinner.hide();
            title.show();
            setActionBarUp(function(){
                navigateTo(spinner.val());
                spinner.show();
                title.hide();
            });
        },

        hideSections = function() {
            var sections = $('section:visible'),
                nm;
            $.each(sections, function(i,item){
                nm = KIJ2013.Util.ucfirst($(item).attr('id'));
                if(modules[nm] && typeof modules[nm].hide == "function")
                    modules[nm].hide();
            })
            sections.hide();
        },

        showSection = function(name){
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

        setTitle = function(val)
        {
            title.text(val || "KIJ2013");
        },

        addSpinnerItem = function(name,module){
            if(typeof module == "undefined")
                module = name;
            $("<option>").text(name).val(module).appendTo(spinner);
        },

        addActionItem = function(name,module){
            if(typeof module == "undefined")
                module = name;
            $("<option>").text(name).val(module).appendTo(actions);
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
        addMenuItem: addSpinnerItem,
        addActionItem: addActionItem,
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
