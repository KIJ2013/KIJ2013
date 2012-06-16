//var rssURL = "http://www.kij13.org.uk/category/latest-news/feed/";
var rssURL = "news.rss";
var db;
var activity = 'list';

function onLoad() {
    if(!window.openDatabase)
    {
        $('#news-list').html('<p>Sorry Support for your device is not ready yet. Please try again in the future.</p>');
        return;
    }
    db = window.openDatabase("newsDB", "1.0", "News Database", 256*1024);
    createDatabase();
    loadItems();
    fetchItems();
    // Hides mobile browser's address bar when page is done loading.
    setTimeout(function() { window.scrollTo(0, 1); }, 1);
}

function createDatabase() {
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS `items` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255), `date` int, `description` text)');
    });
}

/**
* Load items from database
*/
function loadItems()
{
    if(activity != 'list')
        return;
  db.readTransaction(function(tx){
    tx.executeSql('SELECT guid,title FROM `items` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
        var len = result.rows.length;
        if(len)
        {
            var list = $('<ul id="news-list" class="listview"></ul>');
            for(var i=0;i<len;i++)
            {
                var row = result.rows.item(i);
                var li = $('<li />');
                var item = $('<a />').attr('id', row.guid).text(row.title);
                item.data('guid', row.guid);
                item.click(onClickNewsItem);
                li.append(item);
                list.append(li);
            }
            $('#body').empty().append(list);
        }
        else
            $('#body').append('<div>Loading News</div>');
    });
  });
}

/**
* Fetch new items from web
*/
function fetchItems()
{
    $.get(rssURL, function(data){
        db.transaction(function(tx){
            $(data).find('item').each(function(i,item){
                var guid = $(item).find('guid').text();
                var title = $(item).find('title').text();
                var date = new Date($(item).find('pubDate').text());
                var description = $(item).find('encoded').text();
                description = description || $(item).find('description').text();
                tx.executeSql('INSERT INTO `items` (`guid`, `title`, `date`, `description`) VALUES (?, ?, ?, ?)', [guid, title, (date/1000), description]);
            });
        });
      loadItems();
    },"xml").error(function(jqXHR,status,error){
        showError('Error Fetching Items: '+status);
    });
}

function onClickNewsItem(event)
{
    var sender = $(event.target);
    displayNewsItem(sender.data('guid'));
}

function displayNewsList()
{
    setActionBarUp('index.html');
    setActionBarTitle('News');
    activity = 'list';
    loadItems();
}

function displayNewsItem(guid){
    setActionBarUp(displayNewsList);
    activity = 'item';
    db.readTransaction(function(tx){
        tx.executeSql('SELECT title,date,description FROM `items` WHERE guid = ? LIMIT 30', [guid], function(tx, result){
            if(result.rows.length == 1)
            {
                var item = result.rows.item(0);
                setActionBarTitle(item.title)
                $('#body').empty();
                var content = $('<div style="padding: 10px;"></div>');
                content.append('<h1>'+item.title+'</h1>');
                content.append(item.description);
                $('#body').append(content);
                window.scrollTo(0, 1);
            }
        });
    });
}

function setActionBarUp(fn)
{
    if(typeof fn == "function")
    {
        $('#up-button').removeAttr('href');
        $('#up-button').unbind();
        $('#up-button').click(function(){fn();return false;});
    }
    else if(typeof fn == "string")
    {
        $('#up-button').unbind();
        $('#up-button').attr('href', fn);
    }
}
function setActionBarTitle(title)
{
    $('#action_bar h1').text(title);
}
function showError(message)
{
    $('#popup').text(message);
    $('#popup').show();
    setTimeout(function(){$('#popup').slideUp('normal')},5000);
}
