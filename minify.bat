@echo off
echo kij2013.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o kij2013.min.js kij2013.js
echo news.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o news.min.js news.js
echo events.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o events.min.js events.js
echo style.css
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o style.min.css style.css
pause
