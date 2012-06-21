KIJ2013.EventsPage = function(){

    /**
     * PRIVATE Variables
     */
    ﻿//var iCalURL = "http://www.kij13.org.uk/category/latest-news/feed/";
    var iCalURL = "events.ical";
    var TABLE_NAME = "events";

    /**
     * Create Database
     */
    var createDatabase = function () {
        KIJ2013.db.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS `' + TABLE_NAME + '` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255), `date` int, `category` varchar(255), `remind` bool, `description` text)');
        });
    }

    /**
    * Fetch new items from web
    */
    var fetchItems = function()
    {
    }

    var onClickEventItem = function(event)
    {
        var sender = $(this);
        displayEvent(sender.data('guid'));
    }

    var displayEventsList = function()
    {
        KIJ2013.setActionBarUp('index.html');
        KIJ2013.setActionBarTitle('Events');
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT guid,title,date,category,remind FROM `' + TABLE_NAME + '` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
                var len = result.rows.length;
                if(len)
                {
                    var list = $('<ul/>')
                        .attr('id', "event-list")
                        .addClass("listview");
                    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    for(var i=0;i<len;i++)
                    {
                        var row = result.rows.item(i);
                        var li = $('<li/>');
                        var item = $('<a/>').attr('id', row.guid);
                        var date = new Date(row.date*1000);
                        var datetext = $('<p/>')
                            .addClass('date-text')
                            .text(date.getDate() + " " + month[date.getMonth()]);
                        var text = $('<p/>')
                            .addClass('title')
                            .text(row.title);
                        var remind = $('<a/>')
                            .addClass('remind')
                            .addClass(row.remind ? 'selected' : '')
                            .text('Remind');
                        var category = $('<p/>')
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
                    $('<div/>').attr('id',"loading").text("Loading Events").appendTo('#body');
            });
        });
    }

    var displayEvent = function(guid){
        KIJ2013.setActionBarUp(displayEventsList);
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT title,date,description FROM `' + TABLE_NAME + '` WHERE guid = ? LIMIT 1', [guid], function(tx, result){
                if(result.rows.length == 1)
                {
                    var item = result.rows.item(0);
                    KIJ2013.setActionBarTitle(item.title)
                    $('#body').empty();
                    var content = $('<div/>').css({"padding": "10px"});
                    $('<h1/>').text(item.title).appendTo(content);
                    content.append(item.description);
                    $('#body').append(content);
                    window.scrollTo(0, 1);
                }
            });
        });
    }

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
$(KIJ2013.EventsPage.init);
