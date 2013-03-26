(function(KIJ2013,$,Lawnchair){
    var TABLE_NAME = 'news',
        store,
        fetching = false,
        contentready = false,
        view = null,
        listView,
        itemView,
        settings = {},
        events = $({}),
        // Internal cache of loaded items
        items = {},
        currentItem,

    init = function(){
        settings = KIJ2013.getModuleSettings('News');
        KIJ2013.addMenuItem('News');

        listView = $('#news-list');
        itemView = $('#news div');

        events.bind('itemsready', function(){
            console.log('itemsready');

            // Load first/current news item
            displayNewsItem(currentItem);

            // Populate list
            displayNewsList();

            // If contentready hasn't been fired yet, do it now
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
                    if(!currentItem)
                        currentItem = item.key;
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
                    if(!currentItem)
                        currentItem = item.key;
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
        listView.empty();
        $.each(items,function(index,item){
            var li, el, im, sp;
            li = $('<li/>');
            el = $('<a/>').attr('id', item.key);
            im = $('<div>');
            sp = $('<span/>').text(item.title);
            el.append(im);
            el.append(sp);
            el.data('guid', item.key);
            el.click(onClickNewsItem);
            if(item.image)
                im.css({backgroundImage: "url("+item.image+")"});
            im.css({backgroundColor: generateBackgroundColor(item.key)});
            li.append(el);
            listView.append(li);
        });
        itemView.addClass('hidden-phone');
        listView.removeClass('hidden-phone');
        KIJ2013.hideLoading();
    },

    displayNewsItem = function(guid){
        view = "item";
        KIJ2013.setActionBarUp(function(){
            displayNewsList();
        });
        var item = items[guid];
        KIJ2013.setTitle(item.title);
        itemView.empty();
        $('<h1/>').text(item.title).appendTo(itemView);
        itemView.append(item.description);
        listView.addClass('hidden-phone');
        itemView.removeClass('hidden-phone');
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
