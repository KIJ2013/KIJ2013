@echo off
cd js
echo Combining default modules
cat core.js news.js events.js map.js radio.js learn.js barcode.js settings.js > kij2013.js
echo minifying kij2013.js
java -jar ..\..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o kij2013.min.js kij2013.js
cd ../
echo minifying style.css
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o css/style.min.css css/style.css
pause
