var KIJ2013 = function(){
    var preferences = {},
        TABLE_PREFERENCES = "preferences",
        loading,
        popup;

    return {
        db: null,
        /**
         * Initialise KIJ2013 objects, databases and preferences
         * @param callback Allows a callack to be attached which fires when
         *   preferences have finished loading.
         */
        init: function(callback){
            if(!window.openDatabase)
            {
                $('#body').html('<p>Sorry Support for your device is not ready yet. ' +
                  'Please try again in the future.</p>');
                return;
            }
            this.db = window.openDatabase("KIJ2013", "1.0", "KIJ2013 Database",
              256*1024);
            this.sql('CREATE TABLE IF NOT EXISTS `' + TABLE_PREFERENCES +
              '` (`key` varchar(255) PRIMARY KEY,`value` varchar(255))');
            this.sql("SELECT key,value FROM " + TABLE_PREFERENCES, [],
              function(tx,results){
                  var i, item;
                for(i=0;i<results.rows.length;i++)
                {
                    item = results.rows.item(i);
                    preferences[item.key] = item.value;
                }
                if(typeof callback == "function"){
                    callback();
                }
            });
            $('#menu a').each(function(){
                $(this).click(function(){KIJ2013.navigateTo($(this).text())});
            });
            KIJ2013.setActionBarUp();
            $('section').hide();
            $('#menu').show();
            popup = $('#popup');
            loading = $('#loading')
        },
        sql: function(sql, vars, callback){
            if(typeof callback == "function")
                this.db.readTransaction(function(tx){
                    tx.executeSql(sql,vars,callback);
                });
            else
                this.db.transaction(function(tx){
                    tx.executeSql(sql,vars);
                });
        },
        getPreference: function(name){
            return preferences[name];
        },
        setPreference: function(name, value)
        {
            preferences[name] = value;
            this.sql("INSERT OR REPLACE INTO " + TABLE_PREFERENCES +
                "(key,value) VALUES (?,?)",[name,value]);
        },
        navigateTo: function(name) {
            $('section').hide();
            $('#'+name.toLowerCase()).show();
            KIJ2013.setActionBarUp('Menu');
            KIJ2013.setTitle(name);
            if(KIJ2013[name] && typeof KIJ2013[name].init == "function")
                KIJ2013[name].init();
            setTimeout(function() {window.scrollTo(0, 1);}, 1);
        },
        setActionBarUp: function(fn)
        {
            if(typeof fn == "function")
            {
                $('#up-button').removeAttr('href').unbind().click(function(){
                    fn();
                    return false;
                });
                $('#up-icon').css({'visibilty': 'normal'});
            }
            else if(typeof fn == "string")
            {
                $('#up-button').unbind().click(function(){
                    KIJ2013.navigateTo(fn);
                    return false;
                });
                $('#up-icon').css('visibility', 'visible');
            }
            else if(typeof fn == "undefined")
                $('#up-icon').css('visibility', 'hidden');
        },
        setTitle: function(title)
        {
            var blank = typeof title == "undefined" || title == "",
                default_title = "KIJ2013";
            $('title').text(blank ? default_title : default_title + " - " + title);
            $('#action_bar h1').text(blank ? default_title : title);
        },
        showLoading: function()
        {
            if(loading.length == 0)
            {
                loading = $('<div/>').attr('id', 'loading')
                    .text("Loading").append(
                        $('<img/>').attr('src',"img/ajax-loader.gif"))
                    .appendTo('body');
            }
            loading.show();
        },
        hideLoading: function(){
            loading.hide();
        },
        showError: function(message)
        {
            if(popup.length == 0)
            {
                popup = $('<div/>').attr('id', 'popup').appendTo('body');
            }
            popup.text(message).show();
            setTimeout(function(){
                popup.slideUp('normal')
            },5000);
        }
    }
}();
KIJ2013.Menu = function(){
    return {
        init: function(){
            KIJ2013.setActionBarUp();
            KIJ2013.setTitle();
            setTimeout(function(){window.scrollTo(0,1)},1);
        }
    }
}();
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
        KIJ2013.setActionBarUp('Menu');
        KIJ2013.setTitle('News');
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT guid,title FROM `' + TABLE_NAME + '` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
                var len = result.rows.length,
                    list,
                    i,
                    row,
                    li,
                    item;
                if(len)
                {
                    list = $('<ul/>').attr('id',"news-list").addClass("listview");
                    for(i=0;i<len;i++)
                    {
                        row = result.rows.item(i);
                        li = $('<li/>');
                        item = $('<a/>').attr('id', row.guid).text(row.title);
                        item.data('guid', row.guid);
                        item.click(onClickNewsItem);
                        li.append(item);
                        list.append(li);
                    }
                    $('#news').empty().append(list);
                    KIJ2013.hideLoading();
                }
                else
                    KIJ2013.showLoading();
            });
        });
    },

    displayNewsItem = function(guid){
        KIJ2013.setActionBarUp(displayNewsList);
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT title,date,description FROM `' + TABLE_NAME +
                '` WHERE guid = ? LIMIT 1', [guid], function(tx, result){
                if(result.rows.length == 1)
                {
                    var item = result.rows.item(0),
                        content = $('<div/>').css({"padding": "10px"});
                    KIJ2013.setTitle(item.title);
                    $('<h1/>').text(item.title).appendTo(content);
                    content.append(item.description);
                    $('#news').empty().append(content);
                    setTimeout(function() {window.scrollTo(0, 1);}, 1);
                }
            });
        });
    };

    return {
        init: function(){
            createDatabase();
            displayNewsList();
            fetchItems();
        }
    }
}();
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
        KIJ2013.sql('CREATE TABLE IF NOT EXISTS `' + TABLE_NAME +
            '` (`guid` varchar(255) PRIMARY KEY,`title` varchar(255),' +
            '`date` int,`category` varchar(255),`remind` bool,`description` text)');
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
                        item.title, item.date, item.category, item.remind?1:0,
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
            remind = $(this).toggleClass(className).hasClass(className);
        KIJ2013.sql('UPDATE ' + TABLE_NAME + ' SET `remind` = ? ' +
                'WHERE `guid` = ?', [remind?1:0, guid]);
        return false;
    },

    displayEventsList = function()
    {
        KIJ2013.setActionBarUp('Menu');
        KIJ2013.setTitle('Events');
        var subcamp = KIJ2013.getPreference('subcamp');
        KIJ2013.sql('SELECT guid,title,date,category,remind FROM `' + TABLE_NAME +
                '` WHERE `date` > ? AND (`category` = ? OR `category` = "all") ' +
                'ORDER BY `date` ASC LIMIT 30',
                [(new Date())/1000,subcamp], function(tx, result){
            var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                len = result.rows.length,
                list,
                i,
                row,
                guid,
                li,
                item,
                date,
                datetext,
                text,
                remind,
                category;
            if(len)
            {
                list = $('<ul/>').attr('id', "event-list").addClass("listview");
                for(i=0;i<len;i++)
                {
                    row = result.rows.item(i);
                    guid = row.guid;
                    li = $('<li/>');
                    item = $('<a/>').attr('id', guid);
                    date = new Date(row.date*1000);
                    datetext = $('<p/>')
                        .addClass('date-text')
                        .text(date.getDate() + " " + month[date.getMonth()]);
                    text = $('<p/>')
                        .addClass('title')
                        .text(row.title);
                    remind = $('<a/>')
                        .addClass('remind-btn button')
                        .addClass(row.remind ? 'selected' : '')
                        .text('Remind')
                        .click({guid:guid},onClickRemind);
                    category = $('<p/>')
                        .addClass('category')
                        .text(row.category);
                    item.data('guid', row.guid);
                    item.click(onClickEventItem);
                    item.append(datetext).append(text)
                        .append(remind).append(category);
                    li.append(item);
                    list.append(li);
                }
                $('#events').empty().append(list);
                KIJ2013.hideLoading();
            }
            else
                KIJ2013.showLoading();
        });
    },

    displayEvent = function(guid){
        KIJ2013.setActionBarUp(displayEventsList);
        var subcamp = KIJ2013.getPreference('subcamp');
        KIJ2013.sql('SELECT title,date,remind,category,description FROM `' +
                TABLE_NAME + '` WHERE guid = ? AND ' +
                '(`category` = ? OR `category` = "all") LIMIT 1', [guid,subcamp],
                function(tx, result){
            if(result.rows.length == 1)
            {
                var item = result.rows.item(0),
                    content = $('<div/>').css({"padding": "10px"}),
                    date = new Date(item.date*1000);
                KIJ2013.setTitle(item.title)
                $('#events').empty();
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
                $('#events').append(content);
                setTimeout(function() {window.scrollTo(0, 1);}, 1);
            }
        });
    };

    return {
        init: function() {
            createDatabase();
            displayEventsList();
            fetchItems();
        }
    }
}();
KIJ2013.Map = function(){
    var img_bounds = [0.5785846710205073,51.299361979488744,0.5925965309143088,
        51.305519711648124],
        img_size = [2516,1867],
        xScale = img_size[0]/(img_bounds[2]-img_bounds[0]),
        yScale = img_size[1]/(img_bounds[3]-img_bounds[1]),
        img,
        marker,
        initialised=false,

        lonToX = function(lon){
            if(lon<img_bounds[0])
                throw "OutOfBounds";
            if(lon>img_bounds[2])
                throw "OutOfBounds";
            return (lon-img_bounds[0])*xScale;
        },

        latToY = function(lat){
            if(lat<img_bounds[1])
                throw "OutOfBounds";
            if(lat>img_bounds[3])
                throw "OutOfBounds";
            return (lat-img_bounds[1])*yScale;
        };
    return {
        init: function(){
            if(!initialised){
                img = $('#map img');
                if(img.length == 0)
                {
                    KIJ2013.showLoading();
                    img = $('<img />').attr('src', "img/map.png")
                        .appendTo('#map').load(KIJ2013.hideLoading);
                }
                marker = $('#marker');
                initialised = true;
            }
            if(navigator.geolocation)
            {
                navigator.geolocation.getCurrentPosition(function(position){
                    var coords = position.coords,
                        lat = coords.latitude,
                        lon = coords.longitude;
                    KIJ2013.Map.mark(lat, lon);
                    setTimeout(function(){KIJ2013.Map.moveTo(lat, lon)},2);
                }, function(){KIJ2013.showError('Error Finding Location')});
            }
        },
        moveTo: function(lat, lon)
        {
            try {
                window.scrollTo(lonToX(lon), latToY(lat));
            }
            catch (e){}
        },
        mark: function(lat, lon)
        {
            try {
                marker.css({display: 'block', bottom: latToY(lat),
                    left: lonToX(lon)});
            }
            catch (e){}
        },
        unmark: function(){
            marker.css({display: 'none'});
        }
    }
}();
KIJ2013.Learn = function(){
    var TABLE_NAME = "learn",
        baseURL = "learn.php?id=",
    createTable = function() {
        KIJ2013.db.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS `' + TABLE_NAME +
                '` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255),' +
                '`date` int, `description` text)');
        });
    },
    onClickLearnItem = function(){
        displayItem($(this).data('guid'));
    },
    displayFoundList = function()
    {
        KIJ2013.setActionBarUp('Menu');
        KIJ2013.setTitle('Learn');
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT guid,title FROM `' + TABLE_NAME +
                '` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
                var len = result.rows.length,
                    list,
                    i,
                    row,
                    li,
                    item,
                    title;
                if(len)
                {
                    list = $('<ul/>').attr('id',"learn-list")
                        .addClass("listview");
                    for(i=0;i<len;i++)
                    {
                        row = result.rows.item(i);
                        li = $('<li/>');
                        title = row.title || "* New item";
                        item = $('<a/>').attr('id', row.guid).text(title);
                        item.data('guid', row.guid);
                        item.click(onClickLearnItem);
                        li.append(item);
                        list.append(li);
                    }
                    $('#learn').empty().append(list);
                }
            });
        });
    },
    displayItem = function(guid){
        KIJ2013.setActionBarUp(displayFoundList);
        KIJ2013.db.readTransaction(function(tx){
            tx.executeSql('SELECT title,date,description FROM `' + TABLE_NAME +
                '` WHERE guid = ? LIMIT 1', [guid], function(tx, result){
                if(result.rows.length == 1)
                {
                    var item = result.rows.item(0),
                        content = $('<div/>').css({"padding": "10px"});
                    if(!item.description){
                        KIJ2013.showLoading();
                        loadItem(guid, function(){
                            KIJ2013.hideLoading();
                            displayItem(guid);
                        });
                    }
                    else
                    {
                        KIJ2013.setTitle(item.title);
                        $('<h1/>').text(item.title).appendTo(content);
                        content.append(item.description);
                        $('#learn').empty().append(content);
                        setTimeout(function() {window.scrollTo(0, 1);}, 1);
                    }
                }
            });
        });
    },
    loadItem = function(id, callback){
        $.get(baseURL + id, function(data){
            KIJ2013.db.transaction(function(tx){
                tx.executeSql('UPDATE `' + TABLE_NAME +
                        '` SET `title` = ?, `description` = ? WHERE `guid` = ?',
                    [data.title, data.description, id]);
                if(typeof callback == "function")
                    callback();
            });
        })
    };
    return {
        init: function(){
            createTable();
            displayFoundList();
        },
        // Mark an item as found by inserting it into the database
        add: function(id){
            KIJ2013.db.transaction(function(tx){
                var date = (new Date())/1000;
                tx.executeSql('INSERT INTO `' + TABLE_NAME +
                        '` (`guid`,`date`) VALUES (?, ?)', [id, date]);
            });
        }
    }
}();
KIJ2013.Barcode = function(){
    var video = $('#live')[0],
        canvas = $('<canvas>')[0],
        ctx = canvas.getContext('2d'),
        localMediaStream = null,
        snapshot = function (){
            if(localMediaStream){
                ctx.drawImage(video,0,0);
                qrcode.decode(canvas.toDataURL('image/webp'));
            }
        },
        nav = navigator,
        win = window,
        createObjectURL;
    canvas.width = 640;
    canvas.height = 480;
    // Normalise getUserMedia
    nav.getUserMedia ||
        (nav.getUserMedia = nav.webkitGetUserMedia);
    // Normalise window URL
    win.URL ||
        (win.URL = win.webkitURL || win.msURL || win.oURL);
    // Avoid opera quirk
    createObjectURL = function(stream){
        return (win.URL && win.URL.createObjectURL) ?
            win.URL.createObjectURL(stream) : stream;
    };
    // Set callback for detection of QR Code
    qrcode.callback = function (a)
    {
        if(a) alert(a);
    };
    return {
        init: function(){

            if(nav.getUserMedia){
                nav.getUserMedia({video:true},
                    function(stream) {
                        // Display Preview
                        video.src = createObjectURL(stream);
                        // Keep reference to stream for snapshots
                        localMediaStream = stream;
                        setInterval(snapshot, 1000);
                    },
                    function(err) {
                        console.log("Unable to get video stream!")
                    }
                );
            }
            else
                KIJ2013.showError('Barcode Scanner is not available on your '
                    + 'platform.')
        }
    }
}();
KIJ2013.Debug = function(){

    /**
     * PRIVATE Variables
     */
    var TABLE_NEWS = "news",
        TABLE_EVENTS = "events",
        initialised = false;

    return {
        init: function() {
            if(!initialised){
                $('#subcamp').val(KIJ2013.getPreference('subcamp'));
                $('#clear-news').click(function(){
                    KIJ2013.db.transaction(function(tx){
                        tx.executeSql('DELETE FROM ' + TABLE_NEWS);
                        alert("News Items Cleared");
                    });
                });
                $('#clear-events').click(function(){
                    KIJ2013.db.transaction(function(tx){
                        tx.executeSql('DELETE FROM ' + TABLE_EVENTS);
                        alert("Events Cleared");
                    });
                });
                $('#set-subcamp').click(function(){
                    var val = $('#subcamp').val();
                    KIJ2013.setPreference("subcamp", val);
                    alert("'subcamp' set to '" + val + "'");
                });
                initialised = true;
            }
        }
    }
}();
KIJ2013.init();
