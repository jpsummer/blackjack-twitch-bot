import fs from 'fs';
import tmi from 'tmi.js';
import 'dotenv/config';
import cleanUp from 'node-cleanup';
import Blackjack from './blackjack.js';




// Define configuration options
const options = {
    options: { debug: false, joinInterval: 300 },
    connection: { reconnect: true, secure: true },
    identity: {
      username: process.env.BOT_USERNAME,
      password: process.env.OAUTH_TOKEN
    },
    channels: [
      process.env.CHANNELS
    ]
  };

// Create a client with our options
const client = new tmi.client(options);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();


// Deck Variable containing all cards of a Standard Playing Deck
const initialDeck = [  
    {'value': 'Ace', 'suit': 'Hearts'},      {'value': 'Ace', 'suit': 'Diamonds'},      {'value': 'Ace', 'suit': 'Clubs'},      {'value': 'Ace', 'suit': 'Spades'},
    {'value': 'King', 'suit': 'Hearts'},     {'value': 'King', 'suit': 'Diamonds'},     {'value': 'King', 'suit': 'Clubs'},     {'value': 'King', 'suit': 'Spades'},
    {'value': 'Queen', 'suit': 'Hearts'},    {'value': 'Queen', 'suit': 'Diamonds'},    {'value': 'Queen', 'suit': 'Clubs'},    {'value': 'Queen', 'suit': 'Spades'},
    {'value': 'Jack', 'suit': 'Hearts'},     {'value': 'Jack', 'suit': 'Diamonds'},     {'value': 'Jack', 'suit': 'Clubs'},     {'value': 'Jack', 'suit': 'Spades'},
    {'value': '10', 'suit': 'Hearts'},       {'value': '10', 'suit': 'Diamonds'},       {'value': '10', 'suit': 'Clubs'},       {'value': '10', 'suit': 'Spades'},
    {'value': '9', 'suit': 'Hearts'},        {'value': '9', 'suit': 'Diamonds'},        {'value': '9', 'suit': 'Clubs'},        {'value': '9', 'suit': 'Spades'},
    {'value': '8', 'suit': 'Hearts'},        {'value': '8', 'suit': 'Diamonds'},        {'value': '8', 'suit': 'Clubs'},        {'value': '8', 'suit': 'Spades'},
    {'value': '7', 'suit': 'Hearts'},        {'value': '7', 'suit': 'Diamonds'},        {'value': '7', 'suit': 'Clubs'},        {'value': '7', 'suit': 'Spades'},
    {'value': '6', 'suit': 'Hearts'},        {'value': '6', 'suit': 'Diamonds'},        {'value': '6', 'suit': 'Clubs'},        {'value': '6', 'suit': 'Spades'},
    {'value': '5', 'suit': 'Hearts'},        {'value': '5', 'suit': 'Diamonds'},        {'value': '5', 'suit': 'Clubs'},        {'value': '5', 'suit': 'Spades'},
    {'value': '4', 'suit': 'Hearts'},        {'value': '4', 'suit': 'Diamonds'},        {'value': '4', 'suit': 'Clubs'},        {'value': '4', 'suit': 'Spades'},
    {'value': '3', 'suit': 'Hearts'},        {'value': '3', 'suit': 'Diamonds'},        {'value': '3', 'suit': 'Clubs'},        {'value': '3', 'suit': 'Spades'},
    {'value': '2', 'suit': 'Hearts'},        {'value': '2', 'suit': 'Diamonds'},        {'value': '2', 'suit': 'Clubs'},        {'value': '2', 'suit': 'Spades'}
];


// Durstenfeld shuffle to shuffle the deck of cards
// Parameters: deck, the deck to be shuffled
// Returns: deck, array of a shuffled deck
function shuffleDeck(deck) {

    // Copy deck to not modify the original array
    let copy = JSON.parse(JSON.stringify(deck));

    //Iterate from bottom of deck to the top
    for (let i = copy.length - 1; i > 0; i--) {

        //Pick a random element from group of unshuffled elements
        const j = Math.floor(Math.random() * (i + 1));

        //Swap the picked element to the bottom of the deck, swapping it with an unshuffled element
        [copy[i], copy[j]] = [copy[j], copy[i]];

        //Swapping shuffled elements to the bottom of the deck while simulateously incrementing to the top of the deck
        //Effectively will shuffle the deck from bottom to top
    }

    return copy;
}


// Function to print the entire deck in console for debugging purposes
// Parameters: deck, deck to display
// Returns: nothing
function displayDeck(deck){
    for (const i in deck) {
        // Get Card Value
        let card = deck[i]['value'];
        // Get Suit
        let suit = deck[i]['suit'];

        console.log(`${String.fromCodePoint (0x1F0CF)} ${parseInt(i)+1}: ${card} of ${suit}`);
    }
}


// Function to get cards from hand and display in a string
// Parameters: hand, an array that holds 2 or more card objects
// Returns: String, of formatted version of cards in hand
function displayHand(hand){
    
    // Variable to store card and suit
    let cards = [];
    // Variable to store card separator in string
    //const separator = String.fromCodePoint(0x1F0CF);
    const separator = ' '

    for (const card of hand){
        let suit = '';

        if (card['suit'] == 'Hearts') {suit = ':hearts:';}
        else if (card['suit'] == 'Diamonds') {suit = ':diamonds:';}
        else if (card['suit'] == 'Clubs') {suit = ':clubs:';}
        else if (card['suit'] == 'Spades') {suit = ':spades:';}

        // Add formatted string version to cards array
        cards.push(`[${card['value']} ${suit} ]`);
    }
    //return `${getHandTotal(hand)}: ${cards.join(` ${separator} `)}`;
    return ` ${getHandTotal(hand)} total ${cards.join(` ${separator} `)}`;
}


// Function to calculate the total value of a hand
// Parameters: hand, array variable to be calculated
// Returns: The total value of the hand    
function getHandTotal(hand){

    // variable used to sum the total value of cards in list storing cards
    let total = 0;

    // Deep copy the hand array so we don't mess with the order of which cards were dealt
    let copy = JSON.parse(JSON.stringify(hand));

    // Array to store aces
    let aceArray = []

    // Iterate through hand array and add the aces to the aceArray and delete them from the henad
    for (const index in copy){
        if (copy[index]['value'] == 'Ace'){
            aceArray.push(copy[index]);
            copy.splice(index, 1);
        }
    }
    // Then concatenate the aces to the end of the hand array so they are calculated as they should be
    for (const card of aceArray) {
        copy.push(card);
    }




    // This for loop translates the Ten, Ace and Picture cards into int values
    for (const card of copy){

        // Convert Face cards to their int values
        if (card['value'] == 'Jack') {total += 10;}
        else if (card['value'] == 'Queen') {total += 10;}
        else if (card['value'] == 'King') {total += 10;}
        // else if card is not ace, parse int from non-face cards
        else if (card['value'] != 'Ace') {total += parseInt(card['value']);}
        else if (card['value'] == 'Ace'){
            // If ace would cause you to bust, ace value is 1
            if (total >= 11){
                total += 1;
            }else{
                // Else ace value is 11
                total += 11;
            }
        }
    }
    return total;
}


// Function to deal one card
// Parameters: deck, an array containing all playing cards
// Returns: card, an object containing card and suit
function dealOneCard(deck){
    // Return a card object
    return deck.shift();
}


function playDealerHand(game){
    while (getHandTotal(game.dealerHand) < 17) {
        game.dealerHand.push(dealOneCard(game.deck));
    }
}


function checkWin(game){

    if (getHandTotal(game.playerHand) == 21 && game.playerHand.length == 2){
        return "blackjack"
    } else {
        // If players total is higher than dealers total and is less than 21, player wins
        if (getHandTotal(game.playerHand) > getHandTotal(game.dealerHand) && getHandTotal(game.playerHand) <= 21) {
            return "player";
        }
        // If dealers total is higher than players and is less than 21, dealer wins
        else if (getHandTotal(game.playerHand) < getHandTotal(game.dealerHand) && getHandTotal(game.dealerHand) <= 21) {
            return "dealer";
        }
        // If both players have the same total, push - no winners
        else {
            return "draw";
        }
    }
}


// Function to write temporary game data to a temp file
// Parameters: Game Object containing userID and game data needed to create json file
// Returns: nothing
function writeGameData(game){
    

    // Create JS Object containing game data to write to file
    const object = {
        gamestate: 0,
        username: game.username,
        userID: game.userID,
        playerHand: game.playerHand,
        dealerHand: game.dealerHand,
        dealerHidden: game.dealerHidden,
        deck: game.deck
    };

    
    try {
        
        // Convert object into JSON string
        const data = JSON.stringify(object);

        // Write JSON string into /temp/$userID.json
        fs.writeFileSync(`./temp/${game.userID}.json`,`${data}`);
        console.log(`* Writing data to /temp/${game.userID}.json`);
    } 
    catch(error) {
        console.log(`* Woops! ${error.message}`);
    }
    
    

}


// Function to read game data from temp file
// Parameters: userID, used to read the json from /temp/$userID.json
// Returns: object, containing relevant game data
function readGameData(userID){

    // Read /temp/userID.file if function returns error, log error, else run function
    try {
        const data = fs.readFileSync(`./temp/${userID}.json`);
        console.log(`* Reading Game Data from /temp/${userID}.json`);

        // Parse JSON and convert into Javascript Object
        const object = JSON.parse(data);

        // Return object
        return object;
    }
    catch(error) {
        console.log(`* Woops! ${error.message}`);
    }
}

function removeGameData(userID){
    fs.unlinkSync(`./temp/${userID}.json`);
    console.log(`* Removing /temp/${userID}.json from file system`);
}

// Function to check if a user currently has a game running
// Parameters: userID used to check game data from /temp/$userID.json
// Returns: boolean if user has a current game
function isGameRunning(userID) {
    try {
        const game = readGameData(userID);
        return ((game["gamestate"] > -1) ? true : false);
    }
    catch(error) {
        console.log(`* Woops! Couldn't read game file [${error.message}]`);
    }
    
}


function initialize(twitch){

    // Check if user currently has a game running
    if (isGameRunning(twitch["userID"])) { twitch["client"].say(twitch["channel"], `@${twitch["username"]} you currently have a game running, finish the game or use !bj quit to delete the game`);
    } else {
        // Else create and run a game
        const game = new Blackjack(twitch, shuffleDeck(initialDeck));

        // Deal the cards
        game.playerHand.push(dealOneCard(game.deck));
        game.dealerHand.push(dealOneCard(game.deck));
        game.playerHand.push(dealOneCard(game.deck));
        game.dealerHand.push(dealOneCard(game.deck));
        
        // Write game data to a file and set game active to true
        writeGameData(game);
    }
}

    /*****************    TODO     *********************
        Implement win/loss history
        Implement points and gambling
    */


// Called every time a message comes in
function onMessageHandler (channel, userstate, message, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = ((message.trim()).toLowerCase()).split(' ');

    // Bundle common twitch objects
    const twitch = {
        "channel" : channel, 
        "client" : client,
        "userstate" : userstate,
        "username" : userstate["display-name"],
        "userID" : userstate["user-id"]
    };


    // If message doesnt start with a ! mark, ignore it
    if(!(commandName[0].startsWith('!'))) {return;}
    
    else if (commandName[0] === '!bj') {



        // If !bj new
        if (commandName[1] === 'new') { 
            //console.log(`* Executing ${commandName.join(' ')} command`);

            // initialize a new blackjack game for the user
            initialize(twitch);
            const game = readGameData(twitch["userID"]);

            // Check for blackjack, if Blackjack, Congratulate the player and remove the game
            if (getHandTotal(game.playerHand) == 21) {
                removeGameData(game.userID);
                twitch["client"].say(twitch["channel"], `@${game.username} Congratulations, you have Blackjack! ${displayHand(game.playerHand)} You won! type !bj new to play again`);
            }
            // Else show user their own hand, and hide the dealers second card
            else {
                twitch["client"].say(twitch["channel"], `@${game.username} you have${displayHand(game.playerHand)} dealer has${(game.dealerHidden) ? `${displayHand(game.dealerHand.slice(0,1))} [??]` : displayHand(game.dealerHand)} do you !bj hit or !bj stand?`);
            }

            console.log(`* Executed ${commandName.join(' ')} command`);
        } 



        // If !bj hit
        else if (commandName[1] === 'hit') {
            //console.log(`* Executing ${commandName.join(' ')} command`);

            // If user currently has a game running
            if (isGameRunning(twitch["userID"])) {

                // Read game data and deal a card
                const game = readGameData(twitch["userID"]);
                game.playerHand.push(dealOneCard(game.deck));

                // If dealt card causes player to bust, notify player of loss and remove the game data
                if (getHandTotal(game.playerHand) > 21){
                    twitch["client"].say(twitch["channel"], `@${game.username} Bad Luck! You BUSTED with${displayHand(game.playerHand)} type !bj new to play again`);
                    removeGameData(game.userID);
                }
                // Else show player their cards and the dealers cards and write the new game data to file
                else {
                twitch["client"].say(twitch["channel"], `@${game.username} you have${displayHand(game.playerHand)} dealer has${(game.dealerHidden) ? `${displayHand(game.dealerHand.slice(0,1))} [??]` : displayHand(game.dealerHand)} do you !bj hit or !bj stand?`);
                writeGameData(game);
                }

            }
            // Else there is no game running notify user they can start a new one
            else {
                twitch["client"].say(twitch["channel"], `@${twitch["username"]} you dont have a game running use !bj new to create a new game`);
            }

            console.log(`* Executed ${commandName.join(' ')} command`);
        } 



        // If !bj stand
        else if (commandName[1] === 'stand') {
            //console.log(`* Executing ${commandName.join(' ')} command`);

            // If user currently has a game running
            if (isGameRunning(twitch["userID"])) {

                // Read the game data and set dealerHidden variable to show the dealers second card
                const game = readGameData(twitch["userID"]);
                game.dealerHidden = false;

                // Let the dealer draw until they hit 17 and then show the player what cards the dealer drew
                playDealerHand(game);
                twitch["client"].say(twitch["channel"], `@${game.username} Dealer drew ${displayHand(game.dealerHand)}`);

                // If dealer busts, congratulate user and remove game data
                if (getHandTotal(game.dealerHand) > 21) {
                    twitch["client"].say(twitch["channel"], `@${game.username} Congratulations! Dealer has gone BUST! ${displayHand(game.dealerHand)} type !bj new to play again`);
                    removeGameData(game.userID);
                } 
                // Else check win conditions and notify player if they lost, won or if game was a draw, then remove game data
                else {
                    const win = checkWin(game);

                    if (win === "player") {
                        twitch["client"].say(twitch["channel"], `@${game.username} Congratulations! You won with${displayHand(game.playerHand)} to the dealers${displayHand(game.dealerHand)} type !bj new to play again`);
                        removeGameData(game.userID);
                    }
                    else if (win === "dealer") {
                        twitch["client"].say(twitch["channel"], `@${game.username} Bad Luck! You lost with${displayHand(game.playerHand)} to the dealers${displayHand(game.dealerHand)} type !bj new to play again`);
                        removeGameData(game.userID);
                    } else {
                        twitch["client"].say(twitch["channel"], `@${game.username} It's a DRAW! with${displayHand(game.playerHand)} to the dealers${displayHand(game.dealerHand)} type !bj new to play again`);
                        removeGameData(game.userID);
                    }
                }
            }
            // Else there is no game running notify user they can start a new one
            else {
                twitch["client"].say(twitch["channel"], `@${twitch["username"]} you dont have a game running use !bj new to create a new game`);
            }


            console.log(`* Executed ${commandName.join(' ')} command`);
        }



        // If !bj status
        else if (commandName[1] === 'status') {
            //console.log(`* Executing ${commandName.join(' ')} command`);

            // If there is a game already running
            if (isGameRunning(twitch["userID"])) {
                // Read the game data
                const game = readGameData(twitch["userID"]);
                // Display current status of game to user
                twitch["client"].say(twitch["channel"], `@${game.username} you have${displayHand(game.playerHand)} dealer has${(game.dealerHidden) ? `${displayHand(game.dealerHand.slice(0,1))} [??]` : displayHand(game.dealerHand)} do you !bj hit or !bj stand?`);
            } 
            // Else there is no game running notify user they can start a new one
            else {
                twitch["client"].say(twitch["channel"], `@${twitch["username"]} you dont have a game running use !bj new to create a new game`);
            }

            console.log(`* Executed ${commandName.join(' ')} command`);
        }
        


        // If !bj quit
        else if (commandName[1] === 'quit') {
            //console.log(`* Executing ${commandName.join(' ')} command`);

            // If game is running, remove the game data and notify user that they can create a new game
            if (isGameRunning(twitch["userID"])) {
                removeGameData(twitch["userID"]);
                twitch["client"].say(twitch["channel"], `@${twitch["username"]} your game was deleted, type !bj new to create a new game`);
            }
            // Else there is no game running notify user they can start a new one
            else {
                twitch["client"].say(twitch["channel"], `@${twitch["username"]} you dont have a game running use !bj new to create a new game`);
            }

            console.log(`* Executed ${commandName.join(' ')} command`);
        }



        // If !bj info, notify user of basic info about the game
        else if (commandName[1] === 'info') {
            twitch["client"].say(twitch["channel"], `@${twitch["username"]} The game uses very basic Blackjack rules, the Dealer will only stand on 17 or higher and Dealer's 2nd card is hidden until player has stood their hand type !bj new to start a new game or !bj status to check the status of a running game`);
            console.log(`* Executed ${commandName.join(' ')} command`);
        }



        // If unknown !bj command
        else {
            twitch["client"].say(twitch["channel"], `@${userstate["display-name"]} that's an unknown command try !bj info for the game rules, !bj new to start a new game or !bj status to check the status of a running game`);
            console.log(`* Unknown !bj command notified user`);
        }

    }

    // Else log unknown !command
    else {
    console.log(`* Unknown command ${commandName}`);
    }
  }


// Called every time the bot connects to Twitch chat
function onConnectedHandler (address, port) {
  console.log(`* Connected to ${address}:${port} \n* On Channels: ${client.getOptions()['channels']}`);
}

// Function for what to do when the program exits either unexpectedly or via CTRL+C
// Parameters: exitCode (exitCode 0 when exiting normally, exitcode 1 from unhandled exception) signal (SIGINT (e.g. Ctrl-C), SIGHUP, SIGQUIT, or SIGTERM.)
// Returns: nothing
cleanUp(function (exitCode, signal) {

    console.log(`*  Exiting . . . . . . . . . ${exitCode} or ${signal}`);

    // Read file names from temp dir
    let files = fs.readdirSync('./temp/');

    // Iterate over all temp files and delete them all
    for (const file of files){
        
        fs.unlinkSync(`./temp/${file}`);
        console.log(`* Removing /temp/${file} from file system`);
    }

    // Don't call cleanUp handler again, exit program
    cleanUp.uninstall();
});