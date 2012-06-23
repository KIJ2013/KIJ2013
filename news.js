KIJ2013.News = function(){
    //var rssURL = "http://www.kij13.org.uk/category/latest-news/feed/";
    var rssURL = "news.rss",
        TABLE_NAME = 'news',

    createDatabase = function() {
        KIJ2013.db.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS `' + TABLE_NAME +
                '` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255),' +
                '`date` int, `description` text)');
        });
    },

    /**
    * Fetch new items from web
    */
    fetchItems = function()
    {
        $.get(rssURL, function(data){
            KIJ2013.db.transaction(function(tx){
                $(data).find('item').each(function(i,item){
                    var guid = $(item).find('guid').text(),
                        title = $(item).find('title').text(),
                        date = new Date($(item).find('pubDate').text()),
                        description = $(item).find('encoded').text();
                    description = description || $(item).find('description').text();
                    tx.executeSql('INSERT INTO `' + TABLE_NAME +
                        '` (`guid`, `title`, `date`, `description`) VALUES (?, ?, ?, ?)',
                        [guid, title, (date/1000), description]);
                });
            });
            displayNewsList();
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
        KIJ2013.setActionBarUp('index.html');
        KIJ2013.setActionBarTitle('News');
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT guid,title FROM `' + TABLE_NAME + '` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
                var len = result.rows.length,
                    list = $('<ul/>').attr('id',"news-list").addClass("listview"),
                    i=0;
                if(len)
                {
                    for(;i<len;i++)
                    {
                        var row = result.rows.item(i),
                            li = $('<li/>'),
                            item = $('<a/>').attr('id', row.guid).text(row.title);
                        item.data('guid', row.guid);
                        item.click(onClickNewsItem);
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

    displayNewsItem = function(guid){
        KIJ2013.setActionBarUp(displayNewsList);
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT title,date,description FROM `' + TABLE_NAME + '` WHERE guid = ? LIMIT 1', [guid], function(tx, result){
                if(result.rows.length == 1)
                {
                    var item = result.rows.item(0),
                        content = $('<div/>').css({"padding": "10px"});
                    KIJ2013.setActionBarTitle(item.title);
                    $('<h1/>').text(item.title).appendTo(content);
                    content.append(item.description);
                    $('#body').empty().append(content);
                    window.scrollTo(0, 1);
                }
            });
        });
    };

    return {
        init: function(){
            KIJ2013.init();
            createDatabase();
            displayNewsList();
            fetchItems();
            // Hides mobile browser's address bar when page is done loading.
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 1);
        }
    }
}();
$(KIJ2013.News.init);
