# Standard Calculator Web Application Using Flask-SocketIO & Deployed in Heroku

## Introduction
This is a standard calculator application, implemented using Flask-SocketIO with the app deployed in Heroku.

## Features
- Supports basic mathematical operations: +, -, * and /
- Reports a real-time log of all the past calculations carried out different users connected to the system
- A calculation gets shared automatically with all the connected users once the user presses the = button with a valid calculation

## Files in the program
- **application.py**: This is the main app file and contains the Flask-SocketIO backend for the app.
- **Procfile**: file required for Heroku
- **requirements.txt**: list of Python packages installed (also required for Heroku)
- **templates/**: folder with all HTML files
- **static/**: for the JS script and CSS file

## Usage
### Requirements
- A desktop web application, hence best viewed on a larger screen
- Works on almost all standard browser applications, like Chrome, Safari, Firefox
- Might not work on older versions of IE, which doesn't have socket IO support

### Run app
Use [the link to the production server](https://calculator-logs.herokuapp.com/) directly.

## Further modifications
- Add user-based login system
- Add feature: Delete calculation log
- Add feature: Users can delete logs which have been posted by them, or can raise a request to be delete
- Additional mathematical operations can be added
