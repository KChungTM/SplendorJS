// ==========
// GAME BOARD
// ==========
const actionBanner = document.querySelector(".actionLabel");
const bankGems = document.querySelector(".gems"); 
let nobleCards = document.querySelectorAll(".nobleCard .card-body");
let boardCards = document.querySelectorAll(".gemCard");
let board = document.querySelector("div.boardCards");

// ================
// BUTTON LISTENERS
// ================
const gemButtons = document.querySelectorAll(".gem");
const endTurnButton = document.querySelector(".endTurn");
const undoButton = document.querySelector(".undo");
const buyButton = document.querySelector(".buy");
const reserve = document.querySelector(".reserve");

// ==============
// PLAYER 1 BOARD
// ==============
const player1Tokens = document.querySelector(".player1 .tokens");
const player1Cards = document.querySelectorAll(".player1 .playerCard");
const player1Score = document.querySelector(".score1");
let player1Reserves = document.querySelector(".player1 .reserved");
let player1ReserveCards = document.querySelectorAll(".player1 .reserveCard")

// ==============
// PLAYER 2 BOARD
// ==============
const player2Tokens = document.querySelector(".player2 .tokens");
const player2Cards = document.querySelectorAll(".player2 .playerCard");
const player2Score = document.querySelector(".score2");
let player2Reserves = document.querySelector(".player2 .reserved");
let player2ReserveCards = document.querySelectorAll(".player2 .reserveCard")

// =============
// MAIN FUNCTION
// =============
async function initGame(){
    let Game = {
        
        // STORES DATA FOR PLAYERS
        // =======================
        players :   [
                        {
                            name : "player1",
                            points : 0,
                            totalGems : 0,
                            gems :  {
                                        wild: 0, blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            cards : {
                                        blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            reserved: [null, null, null],
                        },
                        {
                            name : "player2",
                            points : 0,
                            totalGems : 0,
                            gems :  {
                                        wild: 0, blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            cards : {
                                        blue: 0, red: 0, green: 0, brown: 0, white: 0
                                    },
                            reserved: [null, null, null],
                        }
                    ],

        // =========
        // CARD DECK
        // =========
        deck : await importDeck(),

        // ====================
        // GAME'S CURRENT BOARD
        // ====================
        nobles : [null, null, null],
        board : [
                    [null, null, null, null],
                    [null, null, null, null],
                    [null, null, null, null],
                ],

        // =================================================
        // USEFUL GAME ATTRIBUTES TO HELP KEEP TRACK OF INFO
        // =================================================
        activePlayer : 0,
        actionQueue : [],
        actionTaken : false,

        turns : 0,
        tokenCount : [4,4,4,4,4,4],
        takeTwo : [true, true, true, true, true],
        colorOrder : ["blue", "red", "green", "brown", "white"],

        reservedCard : null,
        reserveLocation : null,
        reserveCardTokenCount : [0,0,0,0,0,0],

        // ========================================================
        // SELECTED CARD:[0] = card <object> | [1] = HTML of Card
        // ========================================================
        selectedCard : null,

        // ===============================================================================================
        // BOUGHT CARD:[0] = card <object> | [1] = HTML of Card | [2] = Tier <int> | [3] = Position <int> 
        // ===============================================================================================
        boughtCard : null,
    }
    addGameListeners(Game);
    loadCards(Game);
    loadNobles(Game);
}

// ================
// ADDING LISTENERS
// ================

// MEGA LISTENER FUNCTION:
function addGameListeners(game){
    addTokenListener(game);
    addEndTurnListener(game);
    addUndoListener(game);
    addCardListener(game);
    addCardBoardListener(game);
    addBuyListener(game);
    addReserveListener(game);
    addReserveCardListener(game);
}

// TOKEN LISTENER FUNCTION:
function addTokenListener(game){ 
    gemButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            let tokenType = e.target.classList[0];
            let index = game.colorOrder.indexOf(tokenType)+1
            if(validTokenPickup(game, tokenType, index)){
                game.tokenCount[game.colorOrder.indexOf(tokenType)+1]--;
                game.players[game.activePlayer]["gems"][tokenType]++;
                game.players[game.activePlayer]["totalGems"] += 1;
                updateActionBanner(`Player ${game.activePlayer+1} Has Picked Up A ${tokenType.toUpperCase()} Gem!`);

                updatePlayerTokens(game);
                updateBankTokens(game);
            }
        });
    });   
    console.log("Initialized Tokens...")
}

// END TURN BUTTON LISTENER FUNCTION:
function addEndTurnListener(game){
    endTurnButton.addEventListener("click", (e) =>{
        if(game.nobles.length > 0)
            checkNobles(game);
        updatePlayerScore(game);

        if(game.players[game.activePlayer]["points"] >= 15){
            alert(`Player ${game.activePlayer+1} Has Won!`);
            location.reload();
        }

        if(game.actionQueue.includes("reserve")){
            game.boughtCard = game.reservedCard;
            console.log(game.reserveLocation);
            addCard(game, game.reserveLocation[0], game.reserveLocation[1]);
        }
        else if(game.actionQueue.includes("reserveBuy")){
            console.log("Bought Reserve Card...");
        }
        else if(game.boughtCard != null)
            addCard(game, game.boughtCard[2], game.boughtCard[3]);

        getTotalGems(game);

        game.turns += 1;
        game.activePlayer = game.turns%2;
        game.actionQueue = [];
        game.actionTaken = false;
        
        game.selectedCard = null;
        game.boughtCard = null;

        updateCanTakeTwo(game);
        updateCardBoard(game);

        updateActionBanner(`Player ${game.activePlayer+1}'s Turn!`);
    });
    console.log("Initialized End Turn Button...")
}

// UNDO ACTION BUTTON LISTENER FUNCTION:
function addUndoListener(game){
    undoButton.addEventListener("click", (e) =>{
        console.log(game.actionQueue)
        lastAction = game.actionQueue.pop()

        // UNDO TOKEN ACTIONS
        if(game.colorOrder.includes(lastAction)){
            game.tokenCount[game.colorOrder.indexOf(lastAction)+1] += 1;
            game.players[game.activePlayer]["gems"][lastAction] -= 1;
            game.players[game.activePlayer]["totalGems"] -= 1;
            console.log(game.players[game.activePlayer]["totalGems"])
            game.actionTaken = false;
        }
        // UNDO BUYING ACTIONS
        else if(lastAction === "buy"){
            game.actionTaken = false;
            game.board[game.boughtCard[2]][game.boughtCard[3]] = game.boughtCard[0];

            // UPDATES Game OBJECT'S TOKEN COUNTER
            for(let i = 0; i<5; i++){
                game.players[game.activePlayer]["gems"][game.colorOrder[i]] += game.boughtCard[0].cost[i];
                game.tokenCount[i+1] -= game.boughtCard[0].cost[i]
            }
            game.players[game.activePlayer]["cards"][game.boughtCard[0].color] -= 1;
            
            // UPDATES HTML OF PAGE TO ADD BACK CARD
            let tier = game.boughtCard[1].classList[0];
            let parentContainer = document.querySelector(`.${tier}`).parentElement;

            console.log(parentContainer.innerHTML);
            
            let newRowHTML = "", index = 0;
            if(game.boughtCard[3] == 3)
                newRowHTML = parentContainer.innerHTML + game.boughtCard[1].outerHTML;
            else{
                for(let child of parentContainer.children){
                    if(game.boughtCard[3] == index)
                        newRowHTML = newRowHTML + game.boughtCard[1].outerHTML + child.outerHTML;
                    else
                        newRowHTML += child.outerHTML;
                    index++;
                }
            }
            parentContainer.innerHTML = newRowHTML;
            console.log(parentContainer.children[game.boughtCard[3]])
            game.selectedCard[1] = parentContainer.children[game.boughtCard[3]]
            game.selectedCard[0] = game.boughtCard[0];
            game.boughtCard[1] = null;
            

            console.log(game.selectedCard);
        }
        // UNDO RESERVE ACTIONS
        else if(lastAction == "reserve"){
            console.log("Call to Undo");
            if(game.players[game.activePlayer]["gems"]["wild"] > 0){
                game.tokenCount[0] += 1;
                game.players[game.activePlayer]["gems"]["wild"]
            }
            game.actionQueue = [];
            game.actionTaken = false; 
            console.log(game.players[game.activePlayer]["reserved"]);
            console.log(game.reservedCard)
            game.players[game.activePlayer]["reserved"][game.reservedCard[2]] = null;
            console.log(game.players[game.activePlayer]["reserved"]);
            game.selectedCard = null;

            console.log(game.players[game.activePlayer]["reserved"])

            let cardRow = document.querySelectorAll(`.${game.reservedCard[1].classList[0]}`);
            let parentContainer = cardRow[0].parentElement;
            let position = parseInt(game.reservedCard[1].classList[1].slice(-1))-1;

            let newRowHTML = "";
            if(position == 3)
                newRowHTML = parentContainer.innerHTML + game.reservedCard[1].outerHTML;
            else{
                for(let i = 0; i<parentContainer.children.length; i++){
                    if(position == i)
                        newRowHTML = newRowHTML + game.reservedCard[1].outerHTML + parentContainer.children[i].outerHTML;
                    else
                        newRowHTML += parentContainer.children[i].outerHTML
                }
            }
            parentContainer.innerHTML = newRowHTML;
         
            game.reservedCard = null;
            
            addCardListener(game);
            addCardBoardListener(game);
            updateReserves(game);

        }
        // UNDO RESERVE BUY ACTIONS
        else if(lastAction == "reserveBuy"){
            console.log(game.players[game.activePlayer]["reserved"])
            game.actionQueue = [];
            game.actionTaken = false;
            console.log(game.boughtCard);
            game.players[game.activePlayer]["reserved"][game.boughtCard[3]] = [game.boughtCard[0],game.boughtCard[1]];
            
            console.log(game.tokenCount,game.reserveCardTokenCount);
            for(let i = 1; i<6; i++){
                game.tokenCount[i] -= game.reserveCardTokenCount[i];
            }
            game.tokenCount[0] -= game.reserveCardTokenCount[0];
            for(let j = 0; j<5; j++){
                game.players[game.activePlayer]["gems"][game.colorOrder[j]] += game.reserveCardTokenCount[j+1];
            }
            game.players[game.activePlayer]["gems"]["wild"] += game.reserveCardTokenCount[0];

            console.log(game.players[game.activePlayer]["reserved"])

            game.boughtCard = null;
            game.reserveCardTokenCount = [0,0,0,0,0,0];

            updateReserves(game);
            updatePlayerTokens(game);
            updateBankTokens(game);
        }            
        else
            updateActionBanner("No Action To Undo!");

        boardCards = document.querySelectorAll(".gemCard");
        board = document.querySelector("div.boardCards");

        addCardListener(game);
        addCardBoardListener(game);
        updateBankTokens(game);
        updatePlayerTokens(game);
        updatePlayerCards(game);
    });
    console.log("Initialized Undo Button...")
}

function addBuyListener(game){
    buyButton.addEventListener("click", (e) =>{
        console.log(game.selectedCard)
        if(game.selectedCard[1].classList[0] == "reserveCard"){
            if(validCardPurchase(game)){
                let reservedIndex;          
                for(let i = 0; i<3; i++){
                    if(game.players[game.activePlayer]["reserved"][i] != null){
                        if(game.players[game.activePlayer]["reserved"][i][0] == game.selectedCard[0])
                            reservedIndex = i;
                    }
                }
                
                game.boughtCard = [game.selectedCard[0],game.selectedCard[1],null,reservedIndex];

                console.log(game.boughtCard);
                let cardCost = game.boughtCard[0].cost.slice();

                // ADDS POINTS FROM CARD TO SCORE
                game.players[game.activePlayer]["points"] += game.boughtCard[0].points;

                // CHECKS PLAYERS CARDS FOR GEMS
                for(let i = 0; i<5; i++){
                    cardCost[i] -= game.players[game.activePlayer]["cards"][game.colorOrder[i]]
                    if(cardCost[i]<0)
                        cardCost[i] = 0;
                };

                // UPDATES Game OBJECT VARIABLES
                for(let i = 0; i<5; i++){
                    while(game.players[game.activePlayer]["gems"][game.colorOrder[i]] > 0 && cardCost[i] > 0){
                        game.players[game.activePlayer]["gems"][game.colorOrder[i]] -= 1;
                        game.players[game.activePlayer]["totalGems"] -= 1        
                        game.reserveCardTokenCount[i+1] += 1
                        cardCost[i] -= 1
                        game.tokenCount[i+1] += 1;
                    }
                }

                remainingCost = cardCost.reduce((total, curr) => total+curr, 0);
                game.players[game.activePlayer]["gems"]["wild"] -= remainingCost;
                game.players[game.activePlayer]["totalGems"] -= remainingCost;
                game.reserveCardTokenCount[0] += remainingCost;

                game.players[game.activePlayer]["cards"][game.boughtCard[0].color] += 1

                if(game.activePlayer == 0){
                    for(let i = 0; i<player1ReserveCards.length; i++){
                        if(game.boughtCard[1] === player1ReserveCards[i]){
                            player1ReserveCards[i].style.visibility = "hidden";
                            for(let j = 0; j<3; j++){
                                if(game.players[game.activePlayer]["reserved"][j] === null)
                                    continue;
                                else if(game.boughtCard[0] === game.players[game.activePlayer]["reserved"][j][0])
                                    game.players[game.activePlayer]["reserved"][j] = null
                            }
                        }
                    }
                }
                else{
                    for(let i = 0; i<player2ReserveCards.length; i++){
                        if(game.boughtCard[1] === player2ReserveCards[i]){
                            player2ReserveCards[i].style.visibility = "hidden";
                            for(let j = 0; j<3; j++){
                                if(game.players[game.activePlayer]["reserved"][j] === null)
                                    continue;
                                else if(game.boughtCard[0] === game.players[game.activePlayer]["reserved"][j][0])
                                    game.players[game.activePlayer]["reserved"][j] = null
                            }
                        }
                    }
                }
                game.actionTaken = true;
                game.actionQueue.push("reserveBuy")

            }
            else{
                updateActionBanner("Can't Buy This Reserve Card!");
            }

            updatePlayerScore(game);
            updatePlayerCards(game);
            updatePlayerTokens(game);
            updateBankTokens(game);
        }
        else if(validCardPurchase(game)){
            let tier = parseInt(game.selectedCard[1].classList[0].slice(-1))-1;
            let position = parseInt(game.selectedCard[1].classList[1].slice(-1))-1;
            game.boughtCard = [game.selectedCard[0],game.selectedCard[1],tier,position];

            let cardCost = game.boughtCard[0].cost;

            // ADDS POINTS FROM CARD TO SCORE
            game.players[game.activePlayer]["points"] += game.boughtCard[0].points;

            // CHECKS PLAYERS CARDS FOR GEMS
            for(let i = 0; i<5; i++){
                cardCost[i] -= game.players[game.activePlayer]["cards"][game.colorOrder[i]]
                if(cardCost[i]<0)
                    cardCost[i] = 0;
            }

            // UPDATES Game OBJECT VARIABLES
            for(let i = 0; i<5; i++){
                while(game.players[game.activePlayer]["gems"][game.colorOrder[i]] > 0 && cardCost[i] > 0){
                    game.players[game.activePlayer]["gems"][game.colorOrder[i]] -= 1;
                    cardCost[i] -= 1
                    game.tokenCount[i+1] += 1;
                }
            }

            remainingCost = cardCost.reduce((total, curr) => total+curr, 0);
            game.players[game.activePlayer]["gems"]["wild"] -= remainingCost;


            game.players[game.activePlayer]["cards"][game.boughtCard[0].color] += 1;

            game.actionTaken = true;
            game.boughtCard[1].remove();
            game.actionQueue.push("buy");
            console.log(tier, position);
            game.board[tier][position] = null;
            console.log(game.board);

            updatePlayerScore(game);
            updatePlayerCards(game);
            updatePlayerTokens(game);
            updateBankTokens(game);
        }
        else{
            updateActionBanner("Can't Buy This Card!");
        }
    });
}

function addReserveListener(game){
    reserve.addEventListener("click", (e) =>{
        console.log("Call to Reserve Butt")
        if(game.selectedCard == null)
            updateActionBanner("Please Select A Card To Reserve!")
        else if(game.selectedCard[1].classList[0] == "reserveCard")
            updateActionBanner("Can't Select Reserve Card!")
        else{
            if(!game.actionTaken && game.actionQueue.length == 0){
                if(game.players[game.activePlayer]["reserved"].includes(null)){
                    console.log(game.players[game.activePlayer]["reserved"]);

                    let reservedIndex = game.players[game.activePlayer]["reserved"].indexOf(null);

                    game.players[game.activePlayer]["reserved"][reservedIndex] = [game.selectedCard[0], game.selectedCard[1]];
                    console.log(game.players[game.activePlayer]["reserved"]);
                    if(game.players[game.activePlayer]["totalGems"] < 10 || game.players[game.activePlayer]["gems"]["wild"] > 0){
                        game.players[game.activePlayer]["gems"]["wild"] += 1;
                        game.tokenCount[0] -= 1;
                    }

                    game.reservedCard = [game.selectedCard[0], game.selectedCard[1], reservedIndex];
                    game.reserveLocation = [game.selectedCard[0].level-1, parseInt(game.selectedCard[1].classList[1].slice(-1))-1];
                    //game.board[game.reserveLocation[0]][game.reserveLocation[0]] = null;

                    game.actionTaken = true;
                    game.actionQueue.push("reserve");
                    game.selectedCard[1].remove();
                    
                    updateBankTokens(game)
                    updatePlayerTokens(game);
                    updateReserves(game);
                }
                else
                    updateActionBanner("Max Amount of Reserves!");
            }
            else
                updateActionBanner("Action Already Taken!");

        }
    });
}

function addReserveCardListener(game){
    player1ReserveCards.forEach((card) =>{
        card.addEventListener("click", (e) =>{
            if(game.activePlayer == 0){
                console.log(e.target);
                boardCards.forEach((card) =>{
                    card.style.border = "unset";
                });
                for(let i = 0; i< e.target.parentElement.children.length; i++){
                    if(e.target.parentElement.children[i] === card){
                        game.selectedCard = [game.players[0]["reserved"][i][0], e.target.parentElement.children[i]];
                    }
                }
            }
        });
    });
    player2ReserveCards.forEach((card) =>{
        card.addEventListener("click", (e) =>{
            if(game.activePlayer == 1){
                console.log(e.target);
                boardCards.forEach((card) =>{
                    card.style.border = "unset";
                });
                for(let i = 0; i< e.target.parentElement.children.length; i++){
                    if(e.target.parentElement.children[i] === card){
                        game.selectedCard = [game.players[0]["reserved"][i][0], e.target.parentElement.children[i]];
                    }
                }
            }
        });
    });
}

function addCardListener(game){
    boardCards.forEach((card) =>{
        card.addEventListener("click", (e) =>{
            e.target.style.border = "0.17vw solid limegreen";

            let tier = parseInt(card.classList[0].slice(-1))-1;
            let position = parseInt(card.classList[1].slice(-1))-1;
            game.selectedCard = [game.board[tier][position], e.target];
        });
    });
    console.log("Initialized Card Listener...")
}

function addCardBoardListener(game){
    board.addEventListener("click", (e) =>{
       if(e.target.classList[2] === "gemCard")
        {
            boardCards.forEach((card) =>{
                if(e.target !== card)
                    card.style.border = "unset";
            });
        }
    });
}


// ============================
// UPDATING CONTENT WITHIN GAME
// ============================

function updateBankTokens(game){
    for(let i = 1; i<6; i++){
        bankGems.children[i].textContent = game.tokenCount[i];
    };
    bankGems.children[0].textContent = game.tokenCount[0];
}

function updateCanTakeTwo(game){
    for(let i = 1; i<6; i++){
        if(game.tokenCount[i] === 4)
            game.takeTwo[i-1] = true;
        else
            game.takeTwo[i-1] = false;
    }
}

function updatePlayerTokens(game){
    if(game.activePlayer == 0){
        for(let token of player1Tokens.children){
            token.textContent = game.players[game.activePlayer]["gems"][token.classList[0]];
        }
    }
    else{
        for(let token of player2Tokens.children){
            token.textContent = game.players[game.activePlayer]["gems"][token.classList[0]];
        } 
    }
}

function updatePlayerCards(game){
    if(game.activePlayer == 0){
        for(let card of player1Cards){
            card.firstElementChild.firstElementChild.textContent = game.players[game.activePlayer]["cards"][card.classList[1]];
        }
    }
    else{
        for(let card of player2Cards){
            card.firstElementChild.firstElementChild.textContent = game.players[game.activePlayer]["cards"][card.classList[1]];
        }
    }
}

function updateActionBanner(message){
    actionBanner.textContent = message;
}

function updateCardBoard(game){
    boardCards.forEach((children) =>{
        let tier = parseInt(children.classList[0].slice(-1))-1;
        let position = parseInt(children.classList[1].slice(-1))-1;

        // CARD FROM Game.Board
        let card = game.board[tier][position]

        if(card != null){
            // GETS CARD CONTENT CONTAINER: [0] = Points | [1] = Cost
            let cardContents = children.firstElementChild.firstElementChild;

            // SETS COLOR OF NEW CARD
            for(let color of game.colorOrder)
                children.classList.remove(color);
            children.classList.add(card.color);

            // SETS POINTS OF NEW CARD
            cardContents.children[0].firstElementChild.textContent = card.points;

            // SETS COST OF NEW CARD
            let newCardHTML = "";
            for(let i = 0; i<5; i++){
                if(card.cost[i] <= 0)
                    continue;
                newCardHTML += `<div class="${game.colorOrder[i]} price">${card.cost[i]}</div>\n`;
            }
            cardContents.children[1].innerHTML = newCardHTML;
        }
        else{
            children.remove()
        }
        
    });
}

function updateNobles(game){
    for(let i = 0; i<3; i++){
        let newNobleHTML = "";
        let noble = game.nobles[i]
        for(let j = 0; j<5; j++){
            if(noble.cost[j] <= 0)
                continue;
            newNobleHTML += `<div class="${game.colorOrder[j]} requirement">${noble.cost[j]}</div>`
        }
        newNobleHTML += `<div class="noblePoints">${noble.points}</div>`

        nobleCards[i].innerHTML = newNobleHTML;
    }
}

function updatePlayerScore(game){
    if(game.activePlayer == 0){
        player1Score.textContent = `Player 1 : ${game.players[game.activePlayer]["points"]}`;
    }
    else{
        player2Score.textContent = `Player 2 : ${game.players[game.activePlayer]["points"]}`;
    }
}

function updateReserves(game){
    console.log("call to update reserves");
    console.log(game.reservedCard);
    for(let player = 0; player<2; player++){
        if(player == 0){
            for(let i = 0; i<3; i++){
                if(game.players[player]["reserved"][i] == null){
                    player1Reserves.children[i].style.visibility = "hidden";
                    player1Reserves.children[i].disabled = true;
                }
                else{
                    console.log(game.players[player]["reserved"]);
                    newReserveHTML = "";
                    for(let j = 0; j<5; j++){
                        if(game.players[player]["reserved"][i][0].cost[j] == 0)
                            continue;
                        newReserveHTML += `<div class="${game.colorOrder[j]} reservePrice">${game.players[player]["reserved"][i][0].cost[j]}</div>`
                    }
                    newReserveHTML += `<div class="reservePoints">${game.players[player]["reserved"][i][0].points}</div>`
                    console.log(newReserveHTML);

                    for(let k = 0; k<5; k++)
                       player1Reserves.children[i].classList.remove(game.colorOrder[k]);
                    player1Reserves.children[i].classList.add(game.players[player]["reserved"][i][0].color);
                    player1Reserves.children[i].innerHTML = newReserveHTML;
                    player1Reserves.children[i].style.visibility = "visible";
                    player1Reserves.children[i].disabled = false;
                }
            }
        }
        else{
            for(let i = 0; i<3; i++){
                if(game.players[player]["reserved"][i] == null){
                    player2Reserves.children[i].style.visibility = "hidden";
                    player2Reserves.children[i].disabled = true;
                }
                else{
                    console.log("HERE");
                    newReserveHTML = "";
                    for(let j = 0; j<5; j++){
                        if(game.players[player]["reserved"][i][0].cost[j] == 0)
                            continue;
                        newReserveHTML += `<div class="${game.colorOrder[j]} reservePrice">${game.players[player]["reserved"][i][0].cost[j]}</div>`
                    }
                    newReserveHTML += `<div class="reservePoints">${game.players[player]["reserved"][i][0].points}</div>`

                    for(let k = 0; k<5; k++)
                       player2Reserves.children[i].classList.remove(game.colorOrder[k]);
                    player2Reserves.children[i].classList.add(game.players[player]["reserved"][i][0].color);
                    player2Reserves.children[i].innerHTML = newReserveHTML;
                    player2Reserves.children[i].style.visibility = "visible";
                    player2Reserves.children[i].disabled = false;
                }
            }
        }
    };
}

// ======================
// CHECK VALID CONDITIONS
// ======================
function validTokenPickup(game, tokenType, tokenIndex){
    if(game.actionTaken){
        updateActionBanner(`You've Already Done An Action!`);
        return false;
    }
    else if(game.tokenCount[tokenIndex] <= 0){
        updateActionBanner(`Not Enough ${tokenType.toUpperCase()} Gems!`);
        return false;
    }
    else if (game.actionQueue.length >= 3){
        updateActionBanner("You've Already Picked Up 3 Gems")
        game.actionTaken = true;
        return false;
    }
    else if(game.players[game.activePlayer].totalGems >= 10){
        updateActionBanner(`You've Got Too Many Gems!`);
        return false;
    }
    else if(game.actionQueue.length == 2 && game.actionQueue[0] == game.actionQueue[1]){
        updateActionBanner("You've Picked Up 2 Of The Same!");
        return false;
    }
    else if(game.actionQueue.includes(tokenType)){
        console.log(game.actionQueue.length, game.takeTwo)
        if(game.actionQueue.length >= 2 || !game.takeTwo[game.colorOrder.indexOf(tokenType)])
            return false;
        game.actionQueue.push(tokenType);
        return true;
    }
    game.actionQueue.push(tokenType);
    return true;
}

function validCardPurchase(game){
    if(game.actionQueue.length == 0){
        let cardCost = game.selectedCard[0].cost.slice();
        console.log(cardCost);

        for(let i = 0; i<5; i++)
            cardCost[i] -= game.players[game.activePlayer]["cards"][game.colorOrder[i]];

        for(let i = 0; i<5; i++)
            cardCost[i] -= game.players[game.activePlayer]["gems"][game.colorOrder[i]];

        wilds = game.players[game.activePlayer]["gems"]["wild"];
        for(let i = 0; i<5; i++){
            while(cardCost[i] > 0){
                if(wilds <= 0)
                    break;
                cardCost[i] -= 1;
                wilds -= 1;
            }   
        }

        cardCost = cardCost.filter(token => token>0);
        if(cardCost.length > 0)
        {
            updateActionBanner("Don't Have Enough Gems!")
            return false;
        }
        updateActionBanner(`Player ${game.activePlayer+1} Just Bought a Card!`)
        return true;
    }
    updateActionBanner("Already Doing Another Action!")
    return false;
        
}

// ============
// GAME ACTIONS
// ============

// FUNCTION: drawCard(<game>) | RETURNS : card <object>
function drawCard(game, tier){
    tier = "tier" + (tier+1);
    if(game.deck[tier].length > 0){
        let cardIndex = Math.floor(Math.random() * game.deck[tier].length);
        let card = game.deck[tier][cardIndex];

        game.deck[tier] = game.deck[tier].slice(0, cardIndex).concat(game.deck[tier].slice(cardIndex+1));

        return card;
    }
    else{
        return null;
    }
}

function addCard(game, tier, position){
    let card = drawCard(game, tier)
    game.board[tier][position] = card;
    
    if(card != null){
        let newRowHTML = "", index = 0;
        let parentContainer = document.querySelector(`.tier${tier+1}`).parentElement;
        if(position == 3)
            newRowHTML = parentContainer.innerHTML + game.boughtCard[1].outerHTML;
        else{
            for(let child of parentContainer.children){
                if(position == index)
                    newRowHTML = newRowHTML + game.boughtCard[1].outerHTML + child.outerHTML;
                else
                    newRowHTML += child.outerHTML;
                index++;
            }
        }
        parentContainer.innerHTML = newRowHTML;

        boardCards = document.querySelectorAll(".gemCard");
        board = document.querySelector("div.boardCards");

        addCardListener(game);
        addCardBoardListener(game);
    }
}

function checkNobles(game){
        let removedOne = false;
        for(let i = 0; i<game.nobles.length; i++){
            if(!removedOne)
            {
                let meetConditions = true;
                for(let j = 0; j<5; j++){
                    if(game.nobles[i].cost[j] == 0)
                        continue;
                    else if(game.nobles[i].cost[j] > game.players[game.activePlayer]["cards"][game.colorOrder[j]])
                        meetConditions = false;
                }
                if(meetConditions){
                    console.log(game.nobles[i], game.players[game.activePlayer]["cards"]);
                    game.players[game.activePlayer]["points"] +=  game.nobles[i].points
                    game.nobles = game.nobles.slice(0, i).concat(game.nobles.slice(i+1));
                    nobleCards[i].remove();
                    nobleCards = document.querySelectorAll(".nobleCard .card-body");
                    removedOne = true;
                }
            }
            else{
                break;
            }
        }     
}

function getTotalGems(game){
    let sum = 0
    for(let i = 0; i<5; i++)
        sum += game.players[game.activePlayer]["gems"][game.colorOrder[i]] 
    sum += game.players[game.activePlayer]["gems"]["wild"];
    game.players[game.activePlayer]["totalGems"] = sum;
}

// ======================
// INITIAL LOAD FUNCTIONS
// ======================
async function importDeck(){
    let deck;
    await fetch("./cardWrite/masterDeck.json").then(response => response.json()).then(importDeck =>{
        deck = importDeck;
    });
    return deck
}

function loadCards(game){
    for(let tier = 0; tier<3; tier++){
        for(let col = 0; col<4; col++){
            game.board[tier][col] = drawCard(game, tier);
        }
    }
    updateCardBoard(game);
    console.log("Initial Board Cards:", game.board);
}

function loadNobles(game){
    for(let i = 0; i<3; i++){
        let nobleIndex = Math.floor(Math.random() * game.deck["nobles"].length);
        game.nobles[i] = game.deck["nobles"][nobleIndex];
        game.deck["nobles"] = game.deck["nobles"].slice(0, nobleIndex).concat(game.deck["nobles"].slice(nobleIndex+1));
    }
    console.log("Inital Board Nobles:", game.nobles)
    updateNobles(game);
}

initGame();