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
         * @param callback Allows a callack to be attached which fires when
         *   preferences have finished loading.
         */
        init = function(callback){
            // Load preferences from store
            store = Lawnchair({name: store_name}, function(){
                var both = false;
                this.get(preferences_key, function(pref){
                    if(pref)
                        preferences = pref;
                    if(both && typeof callback == "function"){
                        callback();
                    }
                    both = true;
                });
                this.get(settings_key, function(sett){
                    if(sett)
                        settings = sett;

                    loadSettings();

                    if(both && typeof callback == "function"){
                        callback();
                    }
                    both = true;
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
        },

        /**
         * Load each URL in turn until one succeeds
         * @param string[] urls Array of urls to try
         * @param function callback Function to be called once successful
         * @param string type Expected dataType, defaults to 'json'
         */
        loadFirst = function(urls, callback, type){
            var l = urls.length,
                e = function(){
                    if(i<l){
                        f(i+1);
                    }
                },
                f = function(i){
                    $.ajax({
                        url: urls[i],
                        dataType: type || 'json',
                        success: callback,
                        error: e
                    });
                };
            f(0);
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
(function(KIJ2013,$,Lawnchair){
    //var rssURL = "http://www.kij13.org.uk/category/latest-news/feed/";
    var rssURL = "feed.php?f=news.rss",
        TABLE_NAME = 'news',
        store,
        fetching = false,
        view = null,

    createDatabase = function() {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        if(!fetching){
            fetching = true;
            $.get(rssURL, function(data){
                var items = [],
                    item,
                    imgs;
                $(data).find('item').each(function(i,xitem){
                    item = { key: $(xitem).find('guid').text(),
                            title: $(xitem).find('title').text(),
                            date: (new Date($(xitem).find('pubDate').text()))/1000,
                            description:
                                $(xitem).find('content\\:encoded, encoded').text() ||
                                $(xitem).find('description').text()
                        };
                    imgs = $(item.description).find('img');
                    if(imgs.length)
                        item.image = $(imgs[0]).attr('src');
                    items.push(item);
                });
                store.batch(items, function(){
                    if(view == "list")
                        displayNewsList();
                });
                fetching = false;
            },"xml").error(function(jqXHR,status,error){
                KIJ2013.showError('Error Fetching Items: '+status);
                fetching = false;
            });
        }
    },

    onClickNewsItem = function(event)
    {
        var sender = $(event.target);
        displayNewsItem(sender.data('guid'));
    },

    displayNewsList = function()
    {
        view = "list";
        KIJ2013.setActionBarUp();
        KIJ2013.setTitle('News');
        KIJ2013.scrollTop();
        store.all(function(items){
            if(items.length)
            {
                items.sort(KIJ2013.Util.sort('date', false));
                var list = $('<ul/>').attr('id',"news-list").addClass("listview");
                $.each(items,function(index,item){
                    var li, el, sp;
                    li = $('<li/>');
                    el = $('<a/>').attr('id', item.key);
                    sp = $('<span/>').text(item.title);
                    el.append(sp);
                    el.data('guid', item.key);
                    el.click(onClickNewsItem);
                    if(index == 0){
                        li.css({width: "100%"})
                        el.css({height: "140px"});
                    }
                    if(item.image)
                        el.css({backgroundImage: "url("+item.image+")"});
                    el.css({backgroundColor: KIJ2013.Util.randomColor(128)});
                    li.append(el);
                    list.append(li);
                });
                $('#news').empty().append(list);
                KIJ2013.hideLoading();
            }
            else
                KIJ2013.showLoading();
        });
    },

    displayNewsItem = function(guid){
        view = "item";
        KIJ2013.setActionBarUp(function(){
            displayNewsList();
        });
        store.get(guid, function(item){
            var content = $('<div/>').css({"padding": "10px"});
            KIJ2013.setTitle(item.title);
            $('<h1/>').text(item.title).appendTo(content);
            content.append(item.description);
            $('#news').empty().append(content);
            KIJ2013.scrollTop();
        });
    },

    init = function(){
        createDatabase();
        fetchItems();
    },

    show = function(){
        displayNewsList();
    },

    hide = function() {
        view = null;
    },

    clearCache = function(){
        store.nuke();
    };

    KIJ2013.Modules.News = {
        init: init,
        show: show,
        hide: hide,
        clearCache: clearCache
    };

}(KIJ2013,jQuery,Lawnchair));
(function(KIJ2013,$,Lawnchair){

    /**
     * PRIVATE Variables
     */
    //var rssURL = "http://www.kij13.org.uk/category/events/feed/";
    var jsonURL = "events.json",
        TABLE_NAME = "events",
        store,
        visible = false,

    /**
     * Create Database
     */
    createDatabase = function () {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        $.get(jsonURL, function(data){
            var items = [],
                item;
            $(data).each(function(i,jitem){
                item = { key: jitem.guid,
                    title: jitem.title,
                    date: jitem.date,
                    category: jitem.category,
                    remind: !!jitem.remind,
                    description: jitem.description };
                store.get(jitem.guid, function(st_item){
                    if(st_item)
                        item.remind = st_item.remind;
                });
                items.push(item);
            });
            store.batch(items, function(){
                if(visible)
                    displayEventsList();
            });
        },"json").error(function(jqXHR,status,error){
            KIJ2013.showError('Error Fetching Events: '+status);
        });
    },

    onClickEventItem = function()
    {
        displayEvent($(this).data('guid'));
    },

    onClickRemind = function(event)
    {
        var guid = event.data.guid,
            className = "active btn-success",
            remind = $(this).toggleClass(className).hasClass(className);
        store.get(guid, function(item){
            item.remind = remind;
            store.save(item);
        });
        return false;
    },

    displayEventsList = function()
    {
        KIJ2013.setActionBarUp();
        KIJ2013.setTitle('Events');
        var subcamp = KIJ2013.getPreference('subcamp');
        store.all(function(items){
            var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                list,
                el,
                guid,
                li,
                date,
                datetext,
                text,
                remind,
                category;
            if(items.length)
            {
                items = items.filter(KIJ2013.Util.filter('date', '>',
                    (new Date())/1000));
                if(subcamp)
                    items = KIJ2013.Util.merge(
                        items.filter(KIJ2013.Util.filter('category', subcamp)),
                        items.filter(KIJ2013.Util.filter('category', 'all')));
                items.sort(KIJ2013.Util.sort('date'));
                list = $('<ul/>').attr('id', "event-list").addClass("listview");
                $.each(items,function(index,item){
                    guid = item.key;
                    li = $('<li/>');
                    el = $('<a/>').attr('id', guid);
                    date = new Date(item.date*1000);
                    datetext = $('<p/>')
                        .addClass('date-text')
                        .text(date.getDate() + " " + month[date.getMonth()]);
                    text = $('<p/>')
                        .addClass('title')
                        .text(item.title);
                    remind = $('<a/>')
                        .addClass('remind-btn btn')
                        .addClass(item.remind ? 'active btn-success' : '')
                        .text('Remind')
                        .click({guid:guid},onClickRemind);
                    category = $('<p/>')
                        .addClass('category')
                        .text(item.category);
                    el.data('guid', guid);
                    el.click(onClickEventItem);
                    el.append(datetext).append(text)
                        .append(remind).append(category);
                    li.append(el);
                    list.append(li);
                });
                $('#events').empty().append(list);
                KIJ2013.hideLoading();
            }
            else
                KIJ2013.showLoading();
        });
    },

    displayEvent = function(guid){
        KIJ2013.setActionBarUp(displayEventsList);
        KIJ2013.scrollTop();
        store.get(guid, function(item){
            if(item){
                var content = $('<div/>').css({"padding": "10px"}),
                    date = new Date(item.date*1000);
                KIJ2013.setTitle(item.title)
                $('#events').empty();
                $('<h1/>').text(item.title).appendTo(content);
                $('<p/>').addClass("date-text")
                    .text(date.toLocaleString())
                    .appendTo(content);
                $('<a/>')
                    .addClass('btn')
                    .addClass(item.remind ? 'active btn-success' : '')
                    .text('Remind')
                    .click({guid:guid},onClickRemind)
                    .appendTo(content);
                $('<p/>')
                    .attr('id', "remind-text")
                    .text(item.remind?
                        "You will be reminded about this event.":
                        "You will not be reminded about this event")
                    .appendTo(content);
                $('<p/>')
                    .addClass('category')
                    .text(item.category)
                    .appendTo(content);
                $('<p/>')
                    .text(item.description)
                    .appendTo(content);
                $('#events').append(content);
            }
        });
    },

    init = function() {
        createDatabase();
        fetchItems();
    },

    show = function(){
        visible = true;
        displayEventsList();
    },

    hide = function(){
        visible = false;
    },

    clearCache = function(){
        store.nuke();
    };

    KIJ2013.Modules.Events = {
        init: init,
        show: show,
        hide: hide,
        clearCache: clearCache
    };

}(KIJ2013,jQuery,Lawnchair));
(function(KIJ2013,$,navigator){
    var img_bounds = [0.5785846710205073,51.299361979488744,0.5925965309143088,
        51.305519711648124],
        img_size = [2516,1867],
        xScale = img_size[0]/(img_bounds[2]-img_bounds[0]),
        yScale = img_size[1]/(img_bounds[3]-img_bounds[1]),
        img,
        marker,
        initialised=false,

        lonToX = function(lon){
            if(lon<img_bounds[0])
                throw "OutOfBounds";
            if(lon>img_bounds[2])
                throw "OutOfBounds";
            return (lon-img_bounds[0])*xScale;
        },

        latToY = function(lat){
            if(lat<img_bounds[1])
                throw "OutOfBounds";
            if(lat>img_bounds[3])
                throw "OutOfBounds";
            return (lat-img_bounds[1])*yScale;
        },

        show = function(){
            var gl = navigator.geolocation;
            if(!initialised){
                img = $('#map img');
                if(img.length == 0)
                {
                    KIJ2013.showLoading();
                    img = $('<img />').attr('src', "img/map.png")
                        .appendTo('#map').load(
                        function(){
                            moveTo(51.3015, 0.584);
                            KIJ2013.hideLoading();
                        });
                }
                marker = $('#marker');
                initialised = true;
            }
            else
                moveTo(51.3015, 0.584);
            if(gl)
            {
                gl.getCurrentPosition(function(position){
                    var coords = position.coords,
                        lat = coords.latitude,
                        lon = coords.longitude;
                    mark(lat, lon);
                    setTimeout(function(){moveTo(lat, lon)},2);
                }, function(){KIJ2013.showError('Error Finding Location')});
            }
        },

        moveTo = function(lat, lon)
        {
            try {
                var win = $(window),
                    height = win.height(),
                    width = win.width(),
                    x = lonToX(lon) - width / 2,
                    y = img_size[1] - latToY(lat) - height / 2;
                setTimeout(function(){window.scrollTo(x, y);},10);
            }
            catch (e){}
        },

        mark = function(lat, lon)
        {
            try {
                marker.css({display: 'block', bottom: latToY(lat),
                    left: lonToX(lon)});
            }
            catch (e){}
        },

        unmark = function(){
            marker.css({display: 'none'});
        };

    KIJ2013.Modules.Map =  {
        show: show,
        moveTo: moveTo,
        mark: mark,
        unmark: unmark
    };

}(KIJ2013,jQuery,navigator));
(function(KIJ2013,$){
    var loaded = false,
        player,
        url = 'http://176.227.210.187:8046/;stream=1',

    init = function(){
        player = $('#player').jPlayer({
            cssSelectorAncestor: "#controls",
            nativeSupport: true,
            ready: function(){
                player.jPlayer("setMedia", {mp3:url});
                loaded = true;
            },
            swfPath: 'swf',
            volume: 60,
            errorAlerts: true
        });
    },

    show = function(){
        KIJ2013.setTitle('Radio');
        if(loaded)
            player.jPlayer('play');
    };

    KIJ2013.Modules.Radio = {
        init: init,
        show: show
    };

}(KIJ2013,jQuery));
(function(KIJ2013,$,Lawnchair){
    var TABLE_NAME = "learn",
        baseURL = "learn.php?id=",
        baseId = 'learn-',
        highlighted_item,
        store,

    /**
     * Create Database
     */
    createDatabase = function () {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },
    onClickLearnItem = function(){
        displayItem($(this).data('guid'));
    },
    displayFoundList = function()
    {
        KIJ2013.setActionBarUp();
        KIJ2013.setTitle('Learn');
        KIJ2013.scrollTop();
        store.all(function(items){
            var len = items.length,
                list;
            if(len)
            {
                list = $('<ul/>').attr('id',"learn-list")
                    .addClass("listview");
                items.sort(KIJ2013.Util.sort("date", false));
                $.each(items, function(index,item){
                    var el, li, title, id;
                    id = item.key;
                    li = $('<li/>').attr('id', baseId+id);
                    title = item.title || "* New item";
                    el = $('<a/>').text(title);
                    el.data('guid', id);
                    el.click(onClickLearnItem);
                    if(id == highlighted_item)
                    {
                        li.addClass('highlight');
                        highlighted_item = null;
                    }
                    li.append(el);
                    list.append(li);
                });
                $('#learn').empty().append(list);
            }
        });
    },
    displayItem = function(guid){
        KIJ2013.setActionBarUp(displayFoundList);
        KIJ2013.scrollTop();
        store.get(guid, function(item){
            if(item)
            {
                var content = $('<div/>').css({"padding": "10px"});
                if(!item.description){
                    KIJ2013.showLoading();
                    loadItem(guid, function(){
                        KIJ2013.hideLoading();
                        displayItem(guid);
                    },function(){
                        KIJ2013.hideLoading();
                        KIJ2013.showError('Sorry, Could not find any '+
                            'information on that item.')
                        displayFoundList();
                    });
                }
                else
                {
                    KIJ2013.setTitle(item.title);
                    $('<h1/>').text(item.title).appendTo(content);
                    content.append(item.description);
                    $('#learn').empty().append(content);
                }
            }
        });
    },
    loadItem = function(id, success, error){
        $.get(baseURL + id, function(data){
            store.get(id, function(item){
                item.title = data.title;
                item.description = data.description;
                store.save(item);
            });
        })
        .success(success)
        .error(error);
    },

    init = function(){
        createDatabase();
    },

    show = function(){
        displayFoundList();
    },

    // Mark an item as found by inserting it into the database
    add = function(id){
        if(!store)
            createDatabase();
        store.get(id, function(item){
            if(!item)
                store.save({ key: id,
                    date: (new Date())/1000 });
        });
    },

    highlight = function(id){
        var el = $('#'+baseId+id),
            cl = 'highlight';
        if(el.length)
        {
            el.addClass(cl);
            setTimeout(function(){
                el.removeClass(cl);
            },3000);
        }
        else
            highlighted_item = id;
    },

    clearCache = function(){
        store.nuke();
    };

    KIJ2013.Modules.Learn = {
        init: init,
        show: show,
        add: add,
        highlight: highlight,
        clearCache: clearCache
    };

}(KIJ2013,jQuery,Lawnchair));
(function(KIJ2013,win,nav){
    var video = $('#live')[0],
        canvas = $('<canvas>')[0],
        ctx = canvas.getContext('2d'),
        localMediaStream = null,
        qr = typeof qrcode !== "undefined" ? qrcode : false,
        interval,
        initialised,

    init = function(){
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
                var id = a.slice(26);
                if(a.slice(0,26) == "http://kij13.org.uk/learn/")
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
