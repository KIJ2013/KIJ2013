@echo off
echo kij2013.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/kij2013.min.js js/kij2013.js
echo kij2013.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o js/qrcode.min.js js/qrcode.js
echo style.css
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o css/style.min.css css/style.css
pause
