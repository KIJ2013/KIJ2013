var rssURL = "http://15thdoverscouts.org.uk/news.rss";
  var db;
  
  function onLoad() {
	if (typeof PhoneGap !== "undefined")
		document.addEventListener("deviceready", onDeviceReady, false);
	else
		onDeviceReady();
  }

  function onDeviceReady() {
	  db = window.openDatabase("newsDB", "1.0", "News Database", 256*1024);
	  createDatabase();
      loadItems();
	  fetchItems();
  }
  
  function createDatabase()
  {
	  db.transaction(function(tx){
		  tx.executeSql('CREATE TABLE IF NOT EXISTS `items` (`guid` varchar(255) PRIMARY KEY, `title` varchar(255), `date` int, `description` text)');
	  });
  }
  
  /**
  	* Load items from database
  	*/
  function loadItems()
  {
	  db.readTransaction(function(tx){
		tx.executeSql('SELECT * FROM `items` ORDER BY `date` DESC LIMIT 30', [], function(tx, result){
			$('#news-list').empty();
			var len = result.rows.length;
			if(len)
			{
				for(var i=0;i<len;i++)
				{
					var row = result.rows.item(i);
					$('<li><a href="#">'+row.title+'</a></li>').appendTo('#news-list');
				}
			}
			else
				$('#news-list').append('<div>Loading News</div>');
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
        		  var description = $(item).find('description').text();
        		  tx.executeSql('INSERT INTO `items` (`guid`, `title`, `date`, `description`) VALUES (?, ?, ?, ?)', [guid, title, (date/1000), description]);
        	  });
    	  });
    	  loadItems();
      },"xml");
  }