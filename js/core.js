var KIJ2013 = (function(window, $, Lawnchair){
    var preferences = {key:"preferences"},
        TABLE_PREFERENCES = "preferences",
        loading,
        beingLoaded,
        popup,
        store,
        modules = {},

        /**
         * Initialise KIJ2013 objects, databases and preferences
         * @param callback Allows a callack to be attached which fires when
         *   preferences have finished loading.
         */
        init = function(callback){
            store = Lawnchair({name: TABLE_PREFERENCES}, function(){
                this.get("preferences", function(pref){
                    if(pref)
                        preferences = pref;
                    if(typeof callback == "function"){
                        callback();
                    }
                });
            });
            setActionBarUp();
            var select = $('#action_bar select'),
                first = false;
            select.empty();
            for(module in modules){
                if(!first)
                    first = module;
                select.append("<option>"+KIJ2013.Util.ucfirst(module)+"</option>");
                if(typeof modules[module].init == "function")
                    modules[module].init();
            }
            select.change(function(){
                navigateTo(select.val());
            });
            popup = $('#popup');
            loading = $('#loading');
            setTimeout(function() {window.scrollTo(0, 1);}, 0);
            setTimeout(function(){
                $('#action_bar').show();
                navigateTo(first);
            },1500);
        },

        getPreference = function(name, def){
            return preferences[name] || def || null;
        },

        setPreference = function(name, value)
        {
            if(name == "key") return;
            preferences[name] = value;
            store.save(preferences);
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
        getPreference: getPreference,
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
        };

    KIJ2013.Util = {
        randomColor: randomColor,
        filter: filter,
        sort: sort,
        merge: merge,
        ucfirst: ucfirst
    };
}());
