# Bitcoin Trading Game README
## Description
Our application is a high-frequency Bitcoin trading game where the user starts with $100,000 (USD) and is then 
presented the opportunity to buy or sell any feasible amount of Bitcoin every minute. The user will have the choice 
to skip ahead in time (to essentially not buy or sell for that time), and they will be provided with the given day's 
tweets (up to the current time) relating to Bitcoin as hints or indications to buy or sell. The goal will be to 
maximize the value of the user's total Bitcoin/USD holdings by the end of the game. The target audience is individuals 
interested in cryptocurrency and those intrigued by the concept of trading and investment strategies. It caters to 
both beginners who want to learn more about how market dynamics can affect cryptocurrency values and seasoned traders 
who want to test their skills against the simulated unpredictability of the crypto market.

## Key Features
We have implemented buttons that the user will need to click to buy/sell. We have im-
plemented sliders for the amount of money you want to buy/sell. The trend of Bitcoin price is displayed in a graph that
continuously updates as time goes along. Daily tweets appear and disappear in our ANALYTICS page. This page also
displays the number of recent predictive tweets by influential Twitter-users, as well as information on recent Bitcoin trading
volumes and high activity days in the Bitcoin community that month. We also have a HISTORICAL DATA page containing
information on previous weeks where Bitcoin prices were high volatile and on the average Bitcoin prices over the past months.
We include text displays to show the player’s net profits/losses on the day/month/all-time and to show the player current
holdings (dollars + Bitcoin).

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
- **/components**: This folder contains React components in general
	- commonDate.js: Creates a datetime as a global variable tha can be used in all pages.
- **/pages**: This folder contains React components corresponding to the pages in the application
	- GamePage.js: The main page that includes the game (graph, buy and sell buttons, login, etc.).
	- AnalyticsPage.js: Page that contains queries for analytics.
	- HistoricalDataPage.js: Page that contains queries for historical data.
	- PastTransactionsPage.js: Page that contains information about current players and players' transactions.
- App.js: Holds the root component of the React application
- config.json: Holds backend server connection information
- index.js: Serves as the main JavaScript entry point to the application and stores the main DOM render call in React
