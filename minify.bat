@echo off
echo kij2013.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/kij2013.min.js js/kij2013.js
echo news.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/news.min.js js/news.js
echo events.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/events.min.js js/events.js
echo map.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/map.min.js js/map.js
echo style.css
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o css/style.min.css css/style.css
pause
