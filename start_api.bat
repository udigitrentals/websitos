@echo off
cd /d C:\Users\Nick\Downloads\WEBSITEOS
call venv\Scripts\activate
python -m uvicorn api:app --reload
pause
