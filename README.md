# digital scrum poker
Digital Scrum Poker built with meteor

This is a tool for distributed teams that want to play Scrum Poker to estimate user stories. It is especially useful to visualize the estimates of each team member in one digital place without the hazzle of always asking the remotes for their votes and explaining them the local estimates again and again.

## See in Action

A running instance can be seen and used at https://poker.digital-scrum.de (German)

## Getting started

* Install meteor: https://www.meteor.com/install
* Clone this repository
* Run on the command line: `meteor npm install`
* Run on the command line: `meteor`
* Go to http://localhost:3000


For more information about Deployment in production, refer to https://guide.meteor.com/deployment.html

## Usage

* Go to http://localhost:3000
* On the fist visit, you will be asked for a name. Enter it. 
  * Every user is asked for a name. That name is stored in the local storage of the browser (there is no user management on server side)
* Create a new session by entering any name for it
* Now create some Stories using the "New Story" Textfield
* Now invite other users by sharing the link that is shown in the box at the bottom of the page, or by showing the QR-Code (especially useful when your screen is shared on a beamer)
* When ready, click on "Start" next to a story to start the poker game
* Every user that wants to contribute to an estimation round must click on "Participate"
  * It is also possible to only watch the round by not clicking the button
* Now select your estimation by clicking on the arrows next to your card, or by using the cursor keys on the keyboard
* Click on "ready" to indicate that you made your choice (a green tick appears)
* When all users made their choices, click on "Show cards"
  * Only the user who created the session has a button: "Show cards"
* No the users can discuss which is the final estimation. This estimation number can be entered by the session creator to the textfield on the top
* Now move to the next story, ...


## Special Thanks

Special thanks go to the creators of the cards deck, i'm using within this tool: <a href="https://github.com/redbooth/scrum-poker-cards">https://github.com/redbooth/scrum-poker-cards</a>

## Contributions

Always welcome :-)
