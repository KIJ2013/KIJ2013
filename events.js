//var iCalURL = "http://www.kij13.org.uk/category/latest-news/feed/";
var iCalURL = "events.ical";
var db;
var activity = 'list';

$(function () {
    if(!window.openDatabase)
    {
        $('#news-list').html('<p>Sorry Support for your device is not ready yet. Please try again in the future.</p>');
        return;
    }
    db = window.openDatabase("eventsDB", "1.0", "News Database", 256*1024);
    createDatabase();
    loadItems();
    fetchItems();
    // Hides mobile browser's address bar when page is done loading.
    setTimeout(function() { window.scrollTo(0, 1); }, 1);
});

function createDatabase() {
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS `items` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255), `date` int, `category` varchar(255), `remind` bool, `description` text)');
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
        tx.executeSql('SELECT guid,title,date,category,remind FROM `items` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
            var len = result.rows.length;
            if(len)
            {
                var list = $('<ul />')
                    .attr('id', "event-list")
                    .addClass("listview");
                var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                for(var i=0;i<len;i++)
                {
                    var row = result.rows.item(i);
                    var li = $('<li />');
                    var item = $('<a />').attr('id', row.guid);
                    var date = new Date(row.date*1000);
                    var datetext = $('<p />')
                        .addClass('date-text')
                        .text(date.getDate() + " " + month[date.getMonth()]);
                    var text = $('<p />')
                        .addClass('title')
                        .text(row.title);
                    var remind = $('<a />')
                        .addClass('remind')
                        .addClass(row.remind ? 'selected' : '')
                        .text('Remind');
                    var category = $('<p />')
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
                $('#body').append('<div>Loading Events</div>');
        });
    });
}

/**
* Fetch new items from web
*/
function fetchItems()
{
}

function onClickEventItem(event)
{
    var sender = $(event.target);
    displayEvent(sender.data('guid'));
}

function displayEventsList()
{
    setActionBarUp('index.html');
    setActionBarTitle('Events');
    activity = 'list';
    loadItems();
}

function displayEventItem(guid){
    setActionBarUp(displayEventsList);
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
