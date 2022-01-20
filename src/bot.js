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



/* 

        COPY ARRAY VERSION, DOESNT MODIFY ORIGINAL ARRAY

// Durstenfeld shuffle to shuffle the deck of cards
// Parameters: deck, the deck to be shuffled
// Returns: deck, array of a shuffled copy of the deck
function shuffleDeck(deck) {

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
 */



// Durstenfeld shuffle to shuffle the deck of cards
// Parameters: deck, the deck to be shuffled
// Returns: deck, array of a shuffled deck
function shuffleDeck(deck) {

    //Iterate from bottom of deck to the top
    for (let i = deck.length - 1; i > 0; i--) {

        //Pick a random element from group of unshuffled elements
        const j = Math.floor(Math.random() * (i + 1));

        //Swap the picked element to the bottom of the deck, swapping it with an unshuffled element
        [deck[i], deck[j]] = [deck[j], deck[i]];

        //Swapping shuffled elements to the bottom of the deck while simulateously incrementing to the top of the deck
        //Effectively will shuffle the deck from bottom to top
    }

    return deck;
}


// Function to print the entire deck in console
// Parameters: deck, deck to display
// Returns: nothing
function displayDeck(game, deck){
    for (const i in deck) {
        // Get Card Value
        let card = deck[i]['value'];
        // Get Suit
        let suit = deck[i]['suit'];
        // ace 1F0A1 king 1F0AE joker 1F0CF
        console.log(`${String.fromCodePoint (0x1F0CF)} ${parseInt(i)+1}: ${card} of ${suit}`);
        //game.client.say(game.channel, `${String.fromCodePoint (0x1F0CF)} ${parseInt(i)+1}: ${card} of ${suit}`);
    }
}


// Function to get cards from hand and display in a string
// Parameters: hand, an array that holds 2 card objects
// Returns: Twitch message from bot displaying username and their hand
function displayHand(game, text, hand){
    
    // Variable to store card and suit
    let cards = []
    let sep = String.fromCodePoint(0x1F0CF);

    for (const card of hand){
        let suit = '';
        /* 
        if (card['suit'] == 'Hearts') {suit = String.fromCodePoint(0x2764)}
        else if (card['suit'] == 'Diamonds') {suit = String.fromCodePoint(0x2666)}
        else if (card['suit'] == 'Clubs') {suit = String.fromCodePoint(0x2663)}
        else if (card['suit'] == 'Spades') {suit = String.fromCodePoint(0x2660)}
         */
        if (card['suit'] == 'Hearts') {suit = ':hearts:'}
        else if (card['suit'] == 'Diamonds') {suit = ':diamonds:'}
        else if (card['suit'] == 'Clubs') {suit = ':clubs:'}
        else if (card['suit'] == 'Spades') {suit = ':spades:'}

        cards.push(`${card['value']} of ${suit}`);
    }

    game.client.say(game.channel, `${game.username} ${text} ${getHandTotal(hand)} ${sep} ${cards.join(` ${sep} `)}`);
}


// Function to calculate the total value of a hand
// Parameters: hand, array variable to be calculated
// Returns: The total value of the hand    
function getHandTotal(hand){

    // variable used to sum the total value of cards in list storing cards
    var total = 0

    // This for loop translates the Ten, Ace and Picture cards into int values
    for (const card of hand){

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
    return total
}


// Function to deal one card
// Parameters: deck, an array containing all playing cards
// Returns: card, an object containing card and suit
function dealOneCard(deck){
    // Return a card object
    return deck.shift();
}


function getHitChoice(){
        // TODO
    //SIGN A GAME WITH USERS USER ID, IF A GAME IS RUNNING, CANNOT START ANOTHER ONE
    // IF NO GAME IS RUNNING CANNOT !HIT OR ANYTHING
} 


function playPlayerHand(){

}


function playDealerHand(){

}

function checkBust(){

}


function checkWin(){

}


// Function to read temporary game data from temp file
// Parameters: Game Objecting containing userID needed to read temp file
// Returns: boolean depending on whether current game is active or not
function isGameRunning(game){

    console.log(`* Reading Game Data to /temp/${game.userID} value is ${fs.readFileSync(`./temp/${game.userID}`)}`)

    // Read /temp/userID.file and return whether file contains true or false for if game running
    return (fs.readFileSync(`./temp/${game.userID}`) == 'true') ? true : false
}


// Function to write temporary game data to a temp file
// Parameters: Game Object containing userID needed to name temp file
// Returns: nothing
function setGameRunning(game, boolean){
    console.log(`* Writing ${boolean} to /temp/${game.userID}`)
    fs.writeFileSync(`./temp/${game.userID}`,`${boolean}`)
}


function initialize(channel, client, userstate){

    const game = new Blackjack(channel, client, userstate, shuffleDeck(initialDeck));
    setGameRunning(game, true)
    for (let i=0; i<2; i++){
        game.playerHand.push(dealOneCard(game.deck));
    }


    displayHand(game, 'you have', game.playerHand);
    
}






// Called every time a message comes in
function onMessageHandler (channel, userstate, message, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = message.trim();

    // If message doesnt start with a ! mark, ignore it
    if(!(commandName.startsWith('!'))) {return;}
    
    // If !blackjack
    else if (commandName === '!bj') {
    initialize(channel, client, userstate);
    console.log(`* Executed ${commandName} command`);
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

    console.log(`* Exiting . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .`)

    // Read file names from temp dir
    const files = fs.readdirSync('./temp/')

    // Iterate over all temp files and delete them all
    for (const file of files){
        fs.unlinkSync(`./temp/${file}`)
    }

    // Don't call cleanUp handler again, exit program
    cleanUp.uninstall();
});