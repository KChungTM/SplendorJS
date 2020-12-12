async function initGame(){ 
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
        
        // INITIALIZE DECK
        // ==========================================
        // CALLS "importDeck()" TO GET DECK FROM JSON
        // ATTR: ["tier1"]["tier2"]["tier3"]["nobles"]
        deck : await importDeck(),
        
        board : [
                    [null, null, null, null],
                    [null, null, null, null],
                    [null, null, null, null]
                ],

        nobles : [null, null, null],

        allCardsHTML : document.querySelectorAll(".cardContent"),

        // SCRAPS THE TOKEN TABLE
        tokens : document.querySelectorAll(".gem"),

        // INITALIZE GAME TRACKERS
        turns : 0,
        activePlayer : 0,
        actionTaken : false,
        actionQueue : [],
        colorOrder : ["blue", "red", "green", "white", "brown"],
        rgbValues : [[56,162,238],[249,54,62],[21,187,123],[81,55,61],[255,252,246]],
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

        updateBoard : function(){
                            let cardElementIndex = 11;
                            this.board.forEach((row) =>{
                                row.forEach((card) =>{
                                    let tokenCostHTML = "";
                                    for(let index = 0; index<5; index++){
                                        if(card.cost[index] > 0)
                                            tokenCostHTML = tokenCostHTML + `<div class=\"${this.colorOrder[index]} price\">${card.cost[index]}</div>\n`;
                                    }

                                    this.allCardsHTML[cardElementIndex].children[0].firstElementChild.textContent = card.points;
                                    this.allCardsHTML[cardElementIndex].children[1].innerHTML = tokenCostHTML;

                                    for(let color in this.colorOrder){
                                        this.allCardsHTML[cardElementIndex].classList.remove(color);
                                    }
                                    this.allCardsHTML[cardElementIndex].style.backgroundColor = "rgb(" + this.rgbValues[this.colorOrder.indexOf(card.color)].join(",") + ")";
                                    cardElementIndex--;
                                });
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

        drawCard : function(tier, position){
                        let cardIndex = Math.floor(Math.random() * this.deck[tier].length);
                        let card = this.deck[tier][cardIndex];

                        this.deck[tier] = this.deck[tier].slice(0,cardIndex).concat(this.deck[tier].slice(cardIndex+1));

                        this.board[parseInt(tier.slice(-1))-1][position] = card
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
    // GAME OBJECTS
    function card(color, level, cost, points){
        this.color = color;
        this.level = level;
        this.cost = cost;
        this.points = points;
    }
    
    // NOBLE OBJECT
    function noble(cost){
        this.cost = cost,
        this.points = 3
    }

    
    // INITALIZE GAME BOARD
    // ====================
    addTokenListener(Game);
    addCardListener(Game);
    addCardBoardListener(Game);
    addTurnListener(Game);
    addUndoListener(Game);
    loadCards(Game); 
    Game.updateBoard();  
    console.log(Game.allCardsHTML);
}

function addTokenListener(game){
    buttons = document.querySelectorAll(".gem");
    buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
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

function addCardListener(game){
    cards = document.querySelectorAll(".gemCard.card");
    cards.forEach((card) => {
        card.addEventListener("click", (e) => {
            e.target.style.border = "0.17vw solid limegreen";
        });
    });
}

function addCardBoardListener(game){
    cardBoard = document.querySelector("div.boardCards");
    cardBoard.addEventListener("click", (e) => {
        for(let row of cardBoard.children){
            for(let card of row.firstElementChild.children){
                if(!(card === e.target))        
                    card.style.border = "unset";
            };
        };
    });
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

function loadCards(game){
    // Initalizes board with cards
    cards = document.querySelectorAll(".gemCard");
    cards.forEach((card) => {
        let tier = card.classList[0], position = parseInt(card.classList[1].slice(-1))-1;
            game.drawCard(tier, position);
    });
    console.log(game.board);
}

async function importDeck(){
    let deck;
    await fetch("./cardWrite/masterDeck.json").then(response => response.json()).then(importDeck =>{
        deck = importDeck;
    });
    return deck
}

initGame();

