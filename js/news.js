(function(KIJ2013,$,Lawnchair){
    var TABLE_NAME = 'news',
        store,
        fetching = false,
        view = null,
        settings = {},

    init = function(){
        settings = KIJ2013.getModuleSettings('News');
        createDatabase();
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
        if(!fetching){
            fetching = true;
            $.get(settings.rssURL, function(data){
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
        var sender = $(event.currentTarget);
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
        /** Public Methods */
        init: init,
        show: show,
        hide: hide,
        clearCache: clearCache
    };

}(KIJ2013,jQuery,Lawnchair));
