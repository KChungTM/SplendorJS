# SplendorJS
 <h3>Splendor but made with JS!</h3>
 
Hello to whoever may be reading this! This is a quick project I thought I'd make to test my newly learned JavaScript, HTML, and CSS skills. I made a copy of my favorite board game, "Splendor", that could be played through the browser locally with another person. Unfortunately, I haven't found a way to play online with another person yet but maybe that will be something I add on a later date...
 
So far I've implemented turn by turn token selection, an end turn button, and an undo button. As of my last update, I created a program to enter the card information into, which stores the data as a JSON file that I will access later. As of the last commit, the game is fully functioning! I finished implementing cards, reserving, score checking, noble checking, etc. so feel free to check it out! It doesn't look the prettiest but it does work as a two player Splendor game.

In the directory <b>cardWrite</b> you will find the base game cards and nobles! Feel free to add more by running the <b>writer.js</b> file! I did add some conditions to maintain game balance however...

 <h4>TAKEAWAYS:</h4>
 HTML: Using Bootstrap, Refresher<br>
 CSS: Refresher<br>
 JavaScript: Promises, Async/Await, JSON Data Storage, Object Manipulation, Function Scopes<br>
 
  <h4>REVISIONS:</h4>
  - Better use of Event Bubbling to handle adding Event Listeners to the cards. Instead of attaching individual listeners to cards, I could have attached a listener to the entire board.
 
<h5>P.S:</h5>
I hope the window works ok for whoever decides to play it. I looks fine on my screen but my knowledge of breakpoints and sizing HTML elements proportionally is pretty abysmal so knock yourself out. The reserve -> buy is also a bit wonky at times as it won't properly listen to mouse clicks. (If this happens, just click the card in the reserve queue again and then click the buy button!)
 
 
