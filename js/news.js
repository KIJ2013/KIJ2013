(function(KIJ2013,$,Lawnchair){
    var TABLE_NAME = 'news',
        store,
        fetching = false,
        contentready = false,
        view = null,
        settings = {},
        events = $({}),
        // Internal cache of loaded items
        items = {},
        currentItem,

    init = function(){
        settings = KIJ2013.getModuleSettings('News');
        events.bind('itemsready', function(){
            console.log('itemsready');
            if(view == "item")
                displayNewsItem(currentItem);
            else
                displayNewsList();
            if(!contentready) {
                events.trigger('contentready');
                contentready = true;
            }
        });

        createDatabase();
        loadItems();
        fetchItems();
    },


    createDatabase = function() {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        // Only fetch once at a time
        if(!fetching){
            fetching = true;
            $.get(settings.rssURL, function(data){
                var new_items = [],
                    item,
                    imgs;
                items = {};
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
                    new_items.push(item);
                    items[item.key] = item;
                });
                events.trigger('itemsready');
                store.batch(new_items);
                fetching = false;
            },"xml").error(function(jqXHR,status,error){
                KIJ2013.showError('Error Fetching Items: '+status);
                fetching = false;
            });
        }
    },

    /**
     * Load Items from Database
     */
    loadItems = function(){
        store.all(function(dbitems){
            if(dbitems.length)
            {
                dbitems.sort(KIJ2013.Util.sort('date', false));
                items = {};
                $.each(dbitems, function(index, item){
                    items[item.key] = item;
                });
                events.trigger('itemsready');
            }
        });
    },

    onClickNewsItem = function(event)
    {
        var sender = $(event.currentTarget);
        currentItem = sender.data('guid');
        displayNewsItem(currentItem);
    },

    displayNewsList = function()
    {
        view = "list";
        KIJ2013.setActionBarUp();
        KIJ2013.setTitle('News');
        KIJ2013.scrollTop();
        var list = $('<ul/>').attr('id',"news-list").addClass("listview");
        $.each(items,function(index,item){
            var li, el, sp;
            li = $('<li/>');
            el = $('<a/>').attr('id', item.key);
            sp = $('<span/>').text(item.title);
            el.append(sp);
            el.data('guid', item.key);
            el.click(onClickNewsItem);
            if(item.image)
                el.css({backgroundImage: "url("+item.image+")"});
            el.css({backgroundColor: generateBackgroundColor(item.key)});
            li.append(el);
            list.append(li);
        });
        $('#news').empty().append(list);
        KIJ2013.hideLoading();
    },

    displayNewsItem = function(guid){
        view = "item";
        KIJ2013.setActionBarUp(function(){
            displayNewsList();
        });
        var item = items[guid],
            content = $('<div/>').css({"padding": "10px"});
        KIJ2013.setTitle(item.title);
        $('<h1/>').text(item.title).appendTo(content);
        content.append(item.description);
        $('#news').empty().append(content);
        KIJ2013.scrollTop();
    },

    generateBackgroundColor = function(data){
        return '#'+Sha1.hash(data).slice(0,6);
    },

    show = function(){
        displayNewsList();
    },

    hide = function() {
        view = null;
    },

    clearCache = function(){
        store.nuke();
    },

    onContentReady = function(callback){
        console.log("News.onContentReady()");
        if(contentready)
            callback();
        else
            events.bind('contentready', callback);
    };

    KIJ2013.Modules.News = {
        /** Public Methods */
        init: init,
        show: show,
        hide: hide,
        clearCache: clearCache,
        contentready: onContentReady
    };

}(KIJ2013,jQuery,Lawnchair));
