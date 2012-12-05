var KIJ2013 = function(){
    var preferences = {key:"preferences"},
        TABLE_PREFERENCES = "preferences",
        loading,
        beingLoaded,
        popup,
        store;

    return {
        /**
         * Initialise KIJ2013 objects, databases and preferences
         * @param callback Allows a callack to be attached which fires when
         *   preferences have finished loading.
         */
        init: function(callback){
            store = Lawnchair({name: TABLE_PREFERENCES}, function(){
                this.get("preferences", function(pref){
                    if(pref)
                        preferences = pref;
                    if(typeof callback == "function"){
                        callback();
                    }
                });
            });
            $('#menu li').each(function(){
                $(this).click(function(){KIJ2013.navigateTo($(this).text())});
            });
            KIJ2013.setActionBarUp();
            $('#action_bar').show();
            $('section').hide();
            KIJ2013.navigateTo("News")
            popup = $('#popup');
            loading = $('#loading');
        },
        getPreference: function(name, def){
            return preferences[name] || def || null;
        },
        setPreference: function(name, value)
        {
            if(name == "key") return;
            preferences[name] = value;
            store.save(preferences);
        },
        navigateTo: function(name) {
            var sections = $('section:visible'),
                nm;
            $.each(sections, function(i,item){
                nm = $(item).attr('id');
                nm = nm.slice(0,1).toUpperCase() + nm.slice(1);
                if(KIJ2013[nm] && typeof KIJ2013[nm].hide == "function")
                    KIJ2013[nm].hide();
            })
            sections.hide();
            $('#'+name.toLowerCase()).show();
            KIJ2013.setActionBarUp('Menu');
            KIJ2013.setTitle(name);
            if(KIJ2013[name] && typeof KIJ2013[name].init == "function")
                KIJ2013[name].init();
            KIJ2013.scrollTop();
        },
        setActionBarUp: function(fn)
        {
            if(typeof fn == "function")
            {
                $('#up-button').removeAttr('href').unbind().click(function(){
                    fn();
                    return false;
                });
                $('#up-icon').css({'visibilty': 'normal'});
            }
            else if(typeof fn == "string")
            {
                $('#up-button').unbind().click(function(){
                    KIJ2013.navigateTo(fn);
                    return false;
                });
                $('#up-icon').css('visibility', 'visible');
            }
            else if(typeof fn == "undefined")
                $('#up-icon').css('visibility', 'hidden');
        },
        setTitle: function(title)
        {
            var blank = typeof title == "undefined" || title == "",
                default_title = "KIJ2013";
            $('title').text(blank ? default_title : default_title + " - " + title);
            $('#action_bar h1').text(blank ? default_title : title);
        },
        showLoading: function()
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
        hideLoading: function(){
            loading.hide();
            if(beingLoaded){
                beingLoaded.show();
                beingLoaded = null;
            }
        },
        showError: function(message)
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
        scrollTop: function(){
            setTimeout(function() {window.scrollTo(0, 1);}, 10);
        }
    }
}();
KIJ2013.Util = function(){
    return {
        filter: function(field, value, condition, primer){
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
        sort: function(field, reverse, primer){
            var key = function (x) {return primer ? primer(x[field]) : x[field]};
            reverse = typeof reverse == "undefined" || reverse;
            return function (a,b) {
                var A = key(a), B = key(b);
                return (A < B ? -1 : (A > B ? +1 : 0)) * [-1,1][+!!reverse];
            }
        },
        merge: function(/* variable number of arrays */){
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
        }
    }
}();
KIJ2013.Menu = function(){
    return {
        init: function(){
            KIJ2013.setActionBarUp();
            KIJ2013.setTitle();
        }
    }
}();
KIJ2013.News = function(){
    //var rssURL = "http://www.kij13.org.uk/category/latest-news/feed/";
    var rssURL = "feed.php?f=news.rss",
        TABLE_NAME = 'news',
        store,

    createDatabase = function() {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        $.get(rssURL, function(data){
            var items = [];
            $(data).find('item').each(function(i,item){
                items.push({ key: $(item).find('guid').text(),
                        title: $(item).find('title').text(),
                        date: (new Date($(item).find('pubDate').text()))/1000,
                        description:
                            $(item).find('content\\:encoded, encoded').text() ||
                            $(item).find('description').text() });
            });
            store.batch(items, function(){displayNewsList();});
        },"xml").error(function(jqXHR,status,error){
            KIJ2013.showError('Error Fetching Items: '+status);
        });
    },

    onClickNewsItem = function(event)
    {
        var sender = $(event.target);
        displayNewsItem(sender.data('guid'));
    },

    displayNewsList = function()
    {
        KIJ2013.setActionBarUp('Menu');
        KIJ2013.setTitle('News');
        KIJ2013.scrollTop();
        store.all(function(items){
            if(items.length)
            {
                items.sort(KIJ2013.Util.sort('date', false));
                var list = $('<ul/>').attr('id',"news-list").addClass("listview");
                $.each(items,function(index,item){
                    var li, el;
                    li = $('<li/>');
                    el = $('<a/>').attr('id', item.key).text(item.title);
                    el.data('guid', item.key);
                    el.click(onClickNewsItem);
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
        KIJ2013.setActionBarUp(displayNewsList);
        store.get(guid, function(item){
            var content = $('<div/>').css({"padding": "10px"});
            KIJ2013.setTitle(item.title);
            $('<h1/>').text(item.title).appendTo(content);
            content.append(item.description);
            $('#news').empty().append(content);
            KIJ2013.scrollTop();
        });
    };

    return {
        init: function(){
            createDatabase();
            displayNewsList();
            fetchItems();
        }
    }
}();
KIJ2013.Events = function(){

    /**
     * PRIVATE Variables
     */
    //var rssURL = "http://www.kij13.org.uk/category/events/feed/";
    var jsonURL = "events.json",
        TABLE_NAME = "events",
        store,

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
            var items = [];
            $(data).each(function(i,item){
                store.get(item.guid, function(st_item){
                    st_item = st_item || {};
                    items.push({ key: item.guid,
                        title: item.title,
                        date: item.date,
                        category: item.category,
                        remind: !!st_item.remind || !!item.remind,
                        description: item.description });
                });
            });
            store.batch(items, function(){displayEventsList();});
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
            className = "selected",
            remind = $(this).toggleClass(className).hasClass(className);
        store.get(guid, function(item){
            item.remind = remind;
            store.save(item);
        });
        return false;
    },

    displayEventsList = function()
    {
        KIJ2013.setActionBarUp('Menu');
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
                        .addClass('remind-btn button')
                        .addClass(item.remind ? 'selected' : '')
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
                    .addClass('button')
                    .addClass(item.remind ? 'selected' : '')
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
    };

    return {
        init: function() {
            createDatabase();
            displayEventsList();
            fetchItems();
        }
    }
}();
KIJ2013.Map = function(){
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
        };
    return {
        init: function(){
            var gl = navigator.geolocation;
            if(!initialised){
                img = $('#map img');
                if(img.length == 0)
                {
                    KIJ2013.showLoading();
                    img = $('<img />').attr('src', "img/map.png")
                        .appendTo('#map').load(
                        function(){
                            KIJ2013.Map.moveTo(51.3015, 0.584);
                            KIJ2013.hideLoading();
                        });
                }
                marker = $('#marker');
                initialised = true;
            }
            else
                KIJ2013.Map.moveTo(51.3015, 0.584);
            if(gl)
            {
                gl.getCurrentPosition(function(position){
                    var coords = position.coords,
                        lat = coords.latitude,
                        lon = coords.longitude;
                    KIJ2013.Map.mark(lat, lon);
                    setTimeout(function(){KIJ2013.Map.moveTo(lat, lon)},2);
                }, function(){KIJ2013.showError('Error Finding Location')});
            }
        },
        moveTo: function(lat, lon)
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
        mark: function(lat, lon)
        {
            try {
                marker.css({display: 'block', bottom: latToY(lat),
                    left: lonToX(lon)});
            }
            catch (e){}
        },
        unmark: function(){
            marker.css({display: 'none'});
        }
    }
}();
KIJ2013.Radio = function(){
    var loaded = false,
        player,
        url = 'http://31.3.242.244:8046/;stream/1';
    return {
        init: function(){
            if(!loaded)
            {
                player = $('#player').jPlayer({
                    cssSelectorAncestor: "#controls",
                    nativeSupport: true,
                    ready: function(){
                        player.jPlayer("setMedia", {mp3:url}).jPlayer('play');
                    },
                    swfPath: 'swf',
                    volume: 60,
                    errorAlerts: true
                });
                loaded = true;
            }
            KIJ2013.setTitle('Radio');
            KIJ2013.setActionBarUp('Menu');
        }
    }
}();
KIJ2013.Learn = function(){
    var TABLE_NAME = "learn",
        baseURL = "learn.php?id=",
        baseId = 'learn-',
        highlight,
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
        KIJ2013.setActionBarUp('Menu');
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
                    if(id == highlight)
                    {
                        li.addClass('highlight');
                        highlight = null;
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
    };
    return {
        init: function(){
            createDatabase();
            displayFoundList();
        },
        // Mark an item as found by inserting it into the database
        add: function(id){
            if(!store)
                createDatabase();
            store.get(id, function(item){
                if(!item)
                    store.save({ key: id,
                        date: (new Date())/1000 });
            });
        },
        highlight: function(id){
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
                highlight = id;
        }
    }
}();
KIJ2013.Barcode = function(){
    var video = $('#live')[0],
        canvas = $('<canvas>')[0],
        ctx = canvas.getContext('2d'),
        localMediaStream = null,
        nav = navigator,
        win = window,
        qr = typeof qrcode !== "undefined" ? qrcode : false,
        snapshot = function (){
            if(localMediaStream && qr){
                ctx.drawImage(video,0,0);
                qr.decode(canvas.toDataURL('image/webp'));
            }
        },
        createObjectURL,
        interval,
        initialised;
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
    return {
        init: function(){
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
        },
        start: function(){
            video.play();
            if(interval)
                clearInterval(interval);
            interval = setInterval(snapshot, 1000);
        },
        stop: function(){
            video.pause();
            clearInterval(interval);
        },
        hide: function(){
            KIJ2013.Barcode.stop();
        }
    }
}();
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
$(function(){
    KIJ2013.News.init();
    setTimeout(KIJ2013.init,1500);
});
