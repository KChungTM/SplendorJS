// IMPORTS
// =======
// IMPORT FS
const fs = require("fs");

// IMPORT LINE READER AND NECESSARY STUFF
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// MAIN FUNCTION THAT CALLS CARDS/NOBLES
async function splendorWrite(){
    // COMPILES DECK AND NOBLES
    deck = await gatherCardValues();
    nobles = await gatherNobles();

    // COMBINES DECK/NOBLE AND WRITE TO JSON
    writeToJSON(deck, nobles)
    console.log("=========================================")
    console.log("DONE CREATING MASTERDECK JSON............");
    console.log("=========================================")
    rl.close();
}

// FUNCTION TO COLLECT NOBLE VALUES
async function gatherNobles(){
    console.log("Splendor Noble Writer\n======================")
    console.log("Cost: Cost in Cards (<BLUE> <RED> <GREEN> <BROWN> <WHITE>)");
    console.log("(Please Type \"Done\" After You Are Finished...)")
    console.log("=========================================================");
    rl.pause();

    //INIT NOBLE DECK
    const nobleDeck = {nobles:[]};
    let nobleInfo = true;

    // ENTER INFO TO CREATE NOBLES
    while(nobleInfo){
        await getNobleInfo().then(values => {
            nobleInfo = values;
        })
        if(nobleInfo === "invalid" ||!nobleInfo)
            continue;
        else{
            nobleDeck.nobles.push(new noble(nobleInfo[0]));
        }
    }

    console.log("==========================================")
    console.log("Finished Compiling the Nobles.............");
    console.log("==========================================\n\n\n")

    return nobleDeck;
}

// FUNCTION TO COLLECT CARD VALUES
async function gatherCardValues(){
    console.log("Splendor Card Writer\n====================")
    console.log("Level: Refers to Card Tier (E.G. BLUE:3 YELLOW:2 GREEN:1)");
    console.log("Cost: Cost in Gems (<BLUE> <RED> <GREEN> <BROWN> <WHITE>)");
    console.log("(Please Type \"Done\" After You Are Finished...)")
    console.log("=========================================================");
    rl.pause();

    // INIT CARD DECK
    const cardDeck = {tier1:[],tier2:[],tier3:[]}
    let cardInfo = true;

    // ENTER INFO TO CREATE CARDS
    while(cardInfo){
        await getCardInfo().then(values => {
            cardInfo = values;
        });
        // CHECKS FOR INVALID CARDS
        if(cardInfo === "invalid")
            continue;

        // ASSIGNS CARDS BASED ON LEVEL
        switch(cardInfo[1]){
            case(1):
                cardDeck.tier1.push(new card(cardInfo[0],cardInfo[1],cardInfo[2],cardInfo[3]));
                break;
            case(2):
                cardDeck.tier2.push(new card(cardInfo[0],cardInfo[1],cardInfo[2],cardInfo[3]));
                break;
            case(3):
                cardDeck.tier3.push(new card(cardInfo[0],cardInfo[1],cardInfo[2],cardInfo[3]));
                break;
            default:
                // CASE WHEN USER INPUTS "Done"
                console.log("=========================================")
                console.log("Finished Compiling the Deck..............");
                console.log("=========================================\n\n\n")
        }
    }
    return cardDeck;
}

// GETS THE NOBLE INFO USERS SUBMIT
async function getNobleInfo(){
    rl.resume();
    let nobleInfo = [];

    return new Promise((resolve, reject) => {
        rl.question("Cards Needed?: ", function(cost){
            if(cost.trim().toLowerCase() === "done"){
                resolve(false);
                rl.pause();
            }
            else{
                cost = cost.trim().split(/\s+/).map(token => parseInt(token));
                if(notValidNoble(cost)){
                    console.log(`[INVALID NOBLE COST: ${cost}]`);
                    resolve("invalid");
                }
                else{
                    nobleInfo.push(cost);
                    console.log(nobleInfo);
                    rl.pause();
                    resolve(nobleInfo);
                }
            }
        });
    });
}

// GETS THE CARD INFO USERS SUBMIT
async function getCardInfo(){
    rl.resume();
    let cardInfo = [];

    return new Promise((resolve, reject) => {
        rl.question("Card Color?: ", function(color){
            if(color.trim().toLowerCase() === "done"){
                resolve(false);
                rl.pause();
            }
            else if(notValidColor(color)){
                console.log(`[INVALID COLOR: ${color}]`);
                resolve("invalid")
            }
            else{
                rl.question("Card Level?: ", function(level){
                    if(notValidLevel(level)){
                        console.log(`[INVALID LEVEL: ${level}]`);
                        resolve("invalid");
                    }
                    else{
                        rl.question("Gem Cost? ", function(cost){
                            cost = cost.trim().split(/\s+/).map(token => parseInt(token))
                            if(notValidCost(cost)){
                                console.log(`[INVALID COST: ${cost}]`);
                                resolve("invalid");
                            }
                            else{
                                rl.question("Points Earned: ", function(points){
                                    if(notValidPoint(parseInt(points))){
                                        console.log(`[INVALID POINTS: ${points}]`);
                                        resolve("invalid");
                                    }
                                    else{
                                        cardInfo.push(color.trim()); cardInfo.push(parseInt(level)); cardInfo.push(cost); cardInfo.push(parseInt(points));
                                        console.log(cardInfo);
                                        rl.pause();
                                        resolve(cardInfo);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

// CHECKS IF NOBLE IS VALID
function notValidNoble(cost){
    if(cost.length === 5){
        cost.forEach(cardCost => {
            if(cardCost < 0 || cardCost > 4)
                return true;
        });
        return false;
    }
    return true; 
}

// CHECKS IF COLOR IS VALID
function notValidColor(color){
    if(["blue","red","green","brown","white"].includes(color.trim().toLowerCase()))
        return false;
    return true;
}

// CHECKS IF LEVEL IS VALID
function notValidLevel(level){
    if (level.trim().length === 1){
        if(level > 0 && level < 4)
            return false;
    }
    return true;
}

// CHECKS IF COST IS VALID
function notValidCost(cost){
    if(cost.length === 5){
        cost.forEach((gemCost) => {
            if(gemCost < 0 || gemCost > 7)
                return true;
        });
        return false;
    }
    return true;
}

// CHECKS IF POINTS ARE A NUMBER
function notValidPoint(points){
    if(isNaN(points)){
        return true;
    }
    return false;
}

// FUNCTION TO WRITE JSON
function writeToJSON(masterDeck, nobles){
    const path = "./masterDeck.json"
    let fileExist = false;

    // COMBINE MY NOBLES KEY WITH DECK OBJECT
    masterDeck["nobles"] = nobles["nobles"];

    // CHECKS DIRECTORY TO SEE IF FILE EXIST
    try{
        if(fs.existsSync(path))
            fileExist = true;
    } catch (err){
        console.log(err);
    }

    // IF FILE EXIST: APPEND CARDS
    // ELSE: CREATE A NEW FILE
    if(fileExist){
        let importDeck = JSON.parse(fs.readFileSync("./masterDeck.json", "utf-8"));

        // ITERATES THROUGH KEYS AND PUSHES NEW CARDS/NOBLES
        Object.keys(masterDeck).forEach(attr => {
            masterDeck[attr].forEach(elem => {
                importDeck[attr].push(elem);
            });
        });
        
        let jsonVer = JSON.stringify(importDeck,function(a,b){
            if(a === "cost" || b === "nobles")
                return JSON.stringify(b);
            return b;
        },"\t").replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}');


        fs.writeFile("masterDeck.json", jsonVer, function(err, result) {
            if(err) console.log('error', err);
        }); 
    }
    else{
        console.log("=========================================")
        console.log("STRINGIFYING THE JS.....................");
        console.log("=========================================\n\n\n")

        // STRINGIFY MY DECK AND USE FUNCTION TO MAKE IT PRETTY
        let jsonVer = JSON.stringify(masterDeck,function(a,b){
            if(a === "cost" || b === "nobles")
                return JSON.stringify(b);
            return b;
        },"\t").replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}');

        console.log("=========================================")
        console.log("WRITING THE JSON FILE....................");
        console.log("=========================================\n\n\n")

        // WRITES IN "MasterDeck.json"
        fs.writeFile("masterDeck.json", jsonVer, function(err, result) {
            if(err) console.log('error', err);
        }); 
    }
}

// CARD OBJECT
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

splendorWrite();