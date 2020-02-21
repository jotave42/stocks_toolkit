
@echo off
call  npm i
cd python
call py -m pip install -r requirements.txt
cd ..
cls
echo RUNNIG FOR THE FIRST TIME...
pause
call node index.js

pause