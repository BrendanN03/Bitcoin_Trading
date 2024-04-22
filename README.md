# Bitcoin Trading Game README
## Description
Our application will be a high frequency Bitcoin trading game where the user starts with $100,000 (in USD) and then is
presented the opportunity to buy or sell any feasible amount of Bitcoin every minute. The user will have  the choice to
skip ahead in time (to essentially not buy or sell for that time), and they will be provided with the given day’s tweets 
(up to the current time) relating to Bitcoin as hints or indications to buy or sell. The goal will be to maximize the
value of the user’s total Bitcoin/USD holdings by the end of the game. The target audience is individuals interested in
cryptocurrency, and those intrigued by the concept of trading and investment strategies. It caters to both beginners who
want to learn more about how market dynamics can affect cryptocurrency values and seasoned traders who want to test their
skills against the simulated unpredictability of the crypto market.

## Key Features
We will implement buttons that the user will need to click to trade/buy/sell. We will implement sliders/spins for the
amount of money you want to buy/sell. The value of the player’s assets (dollars + bitcoin) will be shown in a graph
that continuously updates as time goes along. Tweets will appear and disappear on the side as well. The user will also
be able to filter the tweets to only show predictive tweets by influential Twitter-users. We will also include a slider/spin 
for the amount of minutes/hours/days the user wants to skip ahead (not buy or sell anything), and we will have three buttons
to let user choose between minutes/hours/days. We will also include text displays to show the player’s net profits/losses on
the day/month/all-time and to show the player current holdings (of cash and of Bitcoin).

## Target Audience
- People interested in cryptocurrency.
- People interested in trading and investment strategies.
- People who want to learn more about market dynamics affecting cryptocurrency values.

## Directories
**/server**: This folder contains application files and dependencies for the backend server
- config.json (not included): Holds the RDS connection credentials/information and application configuration settings
- package-lock.json: Saves the exact version of each package in the application dependency tree for installs and maintenance
- package.json: maintains the project dependency tree; defines project properties, scripts, etc.
- routes.js: Contains handler functions for the API routes
- server.js: Has the code for the routed HTTP application (backend server)
<br><br>

**/client**: This folder contains application files and dependencies for the client React application
- package-lock.json: Saves the exact version of each package in the application dependency tree for installs and maintenance
- package.json: maintains the project dependency tree; defines project properties, scripts, etc.
<br><br>

**/client/public**: This folder contains static files
- index.html: Specifies the base HTML, containing basic metadata
<br><br>

**/client/src**: This folder contains main source code for the React application
- **/pages**: This folder contains for React components corresponding to the pages in the application
	- placeholder
- App.js: Holds the root component of the React application
- config.json: Holds backend server connection information
- index.js: Serves as the main JavaScript entry point to the application and stores the main DOM render call in React
