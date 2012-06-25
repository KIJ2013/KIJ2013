KIJ2013.Events = function(){

    /**
     * PRIVATE Variables
     */
    //var rssURL = "http://www.kij13.org.uk/category/events/feed/";
    var jsonURL = "events.json",
        TABLE_NAME = "events",

    /**
     * Create Database
     */
    createDatabase = function () {
        KIJ2013.db.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS `' + TABLE_NAME +
            '` (`guid` varchar(255) PRIMARY KEY,`title` varchar(255),' +
            '`date` int,`category` varchar(255),`remind` bool,`description` text)');
        });
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        $.get(jsonURL, function(data){
            KIJ2013.db.transaction(function(tx){
                $(data).each(function(i,item){
                    tx.executeSql('INSERT INTO `' + TABLE_NAME +
                        '` (`guid`,`title`,`date`,`category`,`remind`,' +
                        '`description`) VALUES (?, ?, ?, ?, ?, ?)', [item.guid,
                        item.title, item.date, item.category, !!item.remind,
                        item.description]);
                });
            });
            displayEventsList();
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
            remind;
        remind = $(this).toggleClass(className).hasClass(className);
        KIJ2013.db.transaction(function(tx){
            tx.executeSql('UPDATE ' + TABLE_NAME + ' SET `remind` = ? ' +
                'WHERE `guid` = ?', [remind?1:0, guid]);
        });
        return false;
    },

    displayEventsList = function()
    {
        KIJ2013.setActionBarUp('index.html');
        KIJ2013.setActionBarTitle('Events');
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT guid,title,date,category,remind FROM `' +
                    TABLE_NAME + '` WHERE `date` > ? ORDER BY `date` ASC LIMIT 30',
                    [(new Date())/1000], function(tx, result){
                var len = result.rows.length,
                    list = $('<ul/>').attr('id', "event-list").addClass("listview"),
                    month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    i=0;
                if(len)
                {
                    for(;i<len;i++)
                    {
                        var row = result.rows.item(i),
                            guid = row.guid,
                            li = $('<li/>'),
                            item = $('<a/>').attr('id', guid),
                            date = new Date(row.date*1000),
                            datetext = $('<p/>')
                            .addClass('date-text')
                            .text(date.getDate() + " " + month[date.getMonth()]),
                            text = $('<p/>')
                            .addClass('title')
                            .text(row.title),
                            remind = $('<a/>')
                            .addClass('remind-btn button')
                            .addClass(row.remind ? 'selected' : '')
                            .text('Remind')
                            .click({guid:guid},onClickRemind),
                            category = $('<p/>')
                            .addClass('category')
                            .text(row.category);
                        item.data('guid', row.guid);
                        item.click(onClickEventItem);
                        item.append(datetext).append(text).append(remind).append(category);
                        li.append(item);
                        list.append(li);
                    }
                    $('#body').empty().append(list);
                }
                else
                    KIJ2013.showLoading();
            });
        });
    },

    displayEvent = function(guid){
        KIJ2013.setActionBarUp(displayEventsList);
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT title,date,remind,category,description FROM `' +
                    TABLE_NAME + '` WHERE guid = ? LIMIT 1', [guid],
                    function(tx, result){
                if(result.rows.length == 1)
                {
                    var item = result.rows.item(0),
                        content = $('<div/>').css({"padding": "10px"}),
                        date = new Date(item.date*1000);
                    KIJ2013.setActionBarTitle(item.title)
                    $('#body').empty();
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
                    $('#body').append(content);
                    window.scrollTo(0, 1);
                }
            });
        });
    };

    return {
        init: function() {
            KIJ2013.init();
            createDatabase();
            displayEventsList();
            fetchItems();
            // Hides mobile browser's address bar when page is done loading.
            setTimeout(function() {window.scrollTo(0, 1);}, 1);
        }
    }
}();
$(KIJ2013.Events.init);
