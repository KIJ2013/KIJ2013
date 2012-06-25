KIJ2013.Debug = function(){

    /**
     * PRIVATE Variables
     */
    var TABLE_NEWS = "news";
    var TABLE_EVENTS = "events";

    return {
        init: function() {
            KIJ2013.init(function(){
                $('#subcamp').val(KIJ2013.getPreference('subcamp'));
            });
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
            // Hides mobile browser's address bar when page is done loading.
            setTimeout(function() {window.scrollTo(0, 1);}, 1);
        }
    }
}();
$(KIJ2013.Debug.init);
