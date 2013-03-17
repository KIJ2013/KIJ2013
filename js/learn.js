(function(KIJ2013,$,Lawnchair){
    var TABLE_NAME = "learn",
        baseId = 'learn-',
        highlighted_item,
        store,settings = {},

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
        $.get(settings.contentURL + id, function(data){
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
        settings = KIJ2013.getModuleSettings('Learn');
        KIJ2013.addMenuItem('Learn');
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
