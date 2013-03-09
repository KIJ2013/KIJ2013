(function(KIJ2013,$,Lawnchair){

    /**
     * PRIVATE Variables
     */
    var TABLE_NAME = "events",
        store,
        visible = false,
        settings = {},

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
        $.get(settings.jsonURL, function(data){
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
        settings = KIJ2013.getModuleSettings('Events');
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
