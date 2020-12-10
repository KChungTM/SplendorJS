function initGame(){
    // INITALIZE GAME OBJECT
    const Game = {
        // INITALIZE PLAYER ATTRIBUTES
        players :   [
                        {
                            name : "player1",
                            playerTokens : document.querySelectorAll(`.player1 .playerGem`),
                            points : 0,
                            totalGems : 0,
                            gems :  {
                                        wild: 0, blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            cards : {
                                        blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    }
                        },
                        {
                            name : "player2",
                            playerTokens : document.querySelectorAll(`.player2 .playerGem`),
                            points : 0,
                            totalGems : 0,
                            gems :  {
                                        wild: 0, blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            cards : {
                                        blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    }
                        }
                    ],
        // SCRAPS THE TOKEN TABLE
        tokens : document.querySelectorAll(".gem"),

        // INITALIZE GAME TRACKERS
        turns : 0,
        activePlayer : 0,
        actionTaken : false,
        actionQueue : [],
        tokenCount : {wild: 4, blue: 4, red: 4, green: 4, brown: 4, white: 4},
        canTakeTwo : {wild: true, blue: true, red: true, green: true, brown: true, white: true},
        actionLabel : document.querySelector(".actionLabel"),

        // INITALIZE GAME METHODS
        updateAction : function(message){
                                            this.actionLabel.textContent = message;
                                        },

        updatePlayerTokens : function(player){
                                                this.players[player]["playerTokens"].forEach((elem) =>{
                                                    elem.textContent = this.players[player]["gems"][elem.classList[0]]
                                                });
                                            },

        updateTokens : function(){
                                    this.tokens.forEach((elem) => {
                                        elem.textContent = this.tokenCount[elem.classList[0]];
                                    });
                            },

        updateCanTakeTwo : function(){
                                        Object.keys(this.tokenCount).forEach((gem) => {
                                            if(this.tokenCount[gem] === 4){
                                                this.canTakeTwo[gem] = true;
                                            }
                                            else{
                                                this.canTakeTwo[gem] = false;
                                            }
                                        });
                                    },
        
        actionValid : function(action){
                                        if(!this.actionTaken){
                                            this.actionQueue.forEach((elem) => {
                                                if(typeof elem !== typeof action){
                                                    this.updateAction("NOT A VALID ACTION!");
                                                    return false;
                                                }        
                                            });
                                            return true;
                                        }
                                        return false;
                                    },

        canTakeToken : function(tokenType){
                                            if(this.actionQueue.length >= 3){
                                                this.actionTaken = true;
                                                return false;
                                            }
                                            else if(this.tokenCount[tokenType] <= 0){
                                                this.updateAction(`There are no more ${tokenType.toUpperCase()} gems left!`);
                                                return false;
                                            }
                                            else if(this.players[this.activePlayer]["totalGems"] >= 10){
                                                this.updateAction(`Player ${this.activePlayer+1} has too many gems!`);
                                                return false;
                                            }
                                            else if(this.actionQueue.includes(tokenType)){
                                                if(this.canTakeTwo[tokenType] && this.actionQueue.length < 2){
                                                    this.actionTaken = true;
                                                    return true;
                                                }
                                                this.updateAction(`Can't Take Two!`);
                                                return false;
                                            }
                                            return true;
                                        },

        withdrawToken : function(tokenType){
                                // DEBUGGGING INFORMATION
                                console.log(`Player:${this.activePlayer+1} | Gem:${tokenType}`);
                                
                                // UPDATES ACTION BOARD
                                this.updateAction(`Player ${this.activePlayer+1} has taken a ${tokenType.toUpperCase()} token!`)

                                // UPDATES COUNTERS IN JS
                                this.tokenCount[tokenType] -= 1;
                                this.players[this.activePlayer]["totalGems"] += 1
                                this.players[this.activePlayer]["gems"][tokenType] += 1;
                                this.actionQueue.push(tokenType);
                                console.log(`ACTION QUEUE: ${this.actionQueue}`);
                            },

        endTurn : function(){
                            // RESETS CONDITIONS AND INCREMENTS TURNS
                            this.turns += 1;
                            this.activePlayer = this.turns%2;
                            this.actionTaken = false;
                            this.actionQueue = [];
                            this.updateCanTakeTwo();

                            // DEBUGGING INFORMATION
                            console.log(`activePlayer: Player ${this.activePlayer+1}`)
                            this.updateAction(`Player ${this.activePlayer+1}'s Turn`);
                        },

        undoAction : function(){
                                if(this.actionQueue.length === 0){
                                    this.updateAction("There is No Action to Undo!")
                                }
                                else{
                                    const lastAction = this.actionQueue.pop()
                                    if(typeof lastAction === "string"){
                                        this.players[this.activePlayer]["gems"][lastAction] -= 1;
                                        this.tokenCount[lastAction] += 1   
                                        this.updatePlayerTokens(this.activePlayer);  
                                        this.updateTokens();   
                                    }
                                } 
                            },
    };
    
    // INITALIZE GAME BOARD
    // ====================
    addTokenListener(Game);
    addTurnListener(Game);
    addUndoListener(Game);
    loadCards();   
}

function addTokenListener(game){
    buttons = document.querySelectorAll(".gem");
    buttons.forEach((button) => {
        button.addEventListener("click", (e) =>{
            tokenType = e.target.classList[0];
            if(game.actionValid(tokenType)){
                if(game.canTakeToken(tokenType)){
                    game.withdrawToken(tokenType);
                    game.updatePlayerTokens(game.activePlayer);
                    button.textContent = game.tokenCount[tokenType];
                }
            }
            else{
                console.log("Can't Take a Token!")
            }
        })
    });
    console.log("Initialized Bank...")
}

function addTurnListener(game){
    //console.log(`Not yet implemented: ${arguments.callee.name}()`);
    button = document.querySelector(".endTurn");
    button.addEventListener("click", (e) =>{
        game.endTurn();
    });
    console.log("Initialized End Turn Button");
}

function addUndoListener(game){
    //console.log(`Not yet implemented: ${arguments.callee.name}()`);
    button = document.querySelector(".undo");
    button.addEventListener("click", (e) => {
        game.undoAction();
    });
    console.log("Initialized Undo Button");
}


function loadCards(){
    // Initalizes board with cards
    console.log(`Not yet implemented: ${arguments.callee.name}()`);
}

initGame();

