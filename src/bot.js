import tmi from 'tmi.js';
import 'dotenv/config';

// Define configuration options
const opts = {
    options: {debug: false, joinInterval: 300 },
    identity: {
      username: process.env.BOT_USERNAME,
      password: process.env.OAUTH_TOKEN
    },
    channels: [
      process.env.CHANNELS
    ]
  };

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();


// Deck Variable containing all cards of a Standard Playing Deck
const initDeck = [  
    {'card': 'Ace', 'suit': 'Hearts'},      {'card': 'Ace', 'suit': 'Diamonds'},      {'card': 'Ace', 'suit': 'Clubs'},      {'card': 'Ace', 'suit': 'Spades'},
    {'card': 'King', 'suit': 'Hearts'},     {'card': 'King', 'suit': 'Diamonds'},     {'card': 'King', 'suit': 'Clubs'},     {'card': 'King', 'suit': 'Spades'},
    {'card': 'Queen', 'suit': 'Hearts'},    {'card': 'Queen', 'suit': 'Diamonds'},    {'card': 'Queen', 'suit': 'Clubs'},    {'card': 'Queen', 'suit': 'Spades'},
    {'card': 'Jack', 'suit': 'Hearts'},     {'card': 'Jack', 'suit': 'Diamonds'},     {'card': 'Jack', 'suit': 'Clubs'},     {'card': 'Jack', 'suit': 'Spades'},
    {'card': '10', 'suit': 'Hearts'},       {'card': '10', 'suit': 'Diamonds'},       {'card': '10', 'suit': 'Clubs'},       {'card': '10', 'suit': 'Spades'},
    {'card': '9', 'suit': 'Hearts'},        {'card': '9', 'suit': 'Diamonds'},        {'card': '9', 'suit': 'Clubs'},        {'card': '9', 'suit': 'Spades'},
    {'card': '8', 'suit': 'Hearts'},        {'card': '8', 'suit': 'Diamonds'},        {'card': '8', 'suit': 'Clubs'},        {'card': '8', 'suit': 'Spades'},
    {'card': '7', 'suit': 'Hearts'},        {'card': '7', 'suit': 'Diamonds'},        {'card': '7', 'suit': 'Clubs'},        {'card': '7', 'suit': 'Spades'},
    {'card': '6', 'suit': 'Hearts'},        {'card': '6', 'suit': 'Diamonds'},        {'card': '6', 'suit': 'Clubs'},        {'card': '6', 'suit': 'Spades'},
    {'card': '5', 'suit': 'Hearts'},        {'card': '5', 'suit': 'Diamonds'},        {'card': '5', 'suit': 'Clubs'},        {'card': '5', 'suit': 'Spades'},
    {'card': '4', 'suit': 'Hearts'},        {'card': '4', 'suit': 'Diamonds'},        {'card': '4', 'suit': 'Clubs'},        {'card': '4', 'suit': 'Spades'},
    {'card': '3', 'suit': 'Hearts'},        {'card': '3', 'suit': 'Diamonds'},        {'card': '3', 'suit': 'Clubs'},        {'card': '3', 'suit': 'Spades'},
    {'card': '2', 'suit': 'Hearts'},        {'card': '2', 'suit': 'Diamonds'},        {'card': '2', 'suit': 'Clubs'},        {'card': '2', 'suit': 'Spades'}
];

var gameActive = false;


/* 

        COPY ARRAY VERSION, DOESNT MODIFY ORIGINAL ARRAY

// Durstenfeld shuffle to shuffle the deck of cards
// Parameters: deck, the deck to be shuffled
// Returns: deck, array of a shuffled copy of the deck
function shuffle_deck(deck) {

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
function shuffle_deck(deck) {

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
function display_deck(channel, client, deck){
    for (const i in deck) {
        // Get Card Value
        let card = deck[i]['card'];
        // Get Suit
        let suit = deck[i]['suit'];
        // ace 1F0A1 king 1F0AE joker 1F0CF
        console.log(`${String.fromCodePoint (0x1F0CF)} ${parseInt(i)+1}: ${card} of ${suit}`);
        //client.say(channel, `${String.fromCodePoint (0x1F0CF)} ${parseInt(i)+1}: ${card} of ${suit}`);
    }
}


// Function to get cards from hand and display in a string
// Parameters: hand, an array that holds 2 card objects
// Returns: Twitch message from bot displaying username and their hand
function display_hand(channel, client, userstate, text, hand){
    
    // Variable to store card and suit
    let cards = []
    let sep = String.fromCodePoint(0x1F0CF);

    for (const i in hand){
        let suit = '';
        /* 
        if (hand[i]['suit'] == 'Hearts') {suit = String.fromCodePoint(0x2764)}
        else if (hand[i]['suit'] == 'Diamonds') {suit = String.fromCodePoint(0x2666)}
        else if (hand[i]['suit'] == 'Clubs') {suit = String.fromCodePoint(0x2663)}
        else if (hand[i]['suit'] == 'Spades') {suit = String.fromCodePoint(0x2660)}
         */
        if (hand[i]['suit'] == 'Hearts') {suit = ':hearts:'}
        else if (hand[i]['suit'] == 'Diamonds') {suit = ':diamonds:'}
        else if (hand[i]['suit'] == 'Clubs') {suit = ':clubs:'}
        else if (hand[i]['suit'] == 'Spades') {suit = ':spades:'}

        cards.push(`${hand[i]['card']} of ${suit}`);
    }

    client.say(channel, `${userstate.username} ${text} ${get_hand_total(hand)} ${sep} ${cards.join(` ${sep} `)}`);
}


// Function to calculate the total value of a hand
// Parameters: hand, array variable to be calculated
// Returns: The total value of the hand    
function get_hand_total(hand){

    // variable used to sum the total value of cards in list storing cards
    var total = 0

    // This for loop translates the Ten, Ace and Picture cards into int values
    for (const i in hand){

        // Variable to store card value
        let c = hand[i]['card'];

        // Convert Face cards to their int values
        if (c == 'Jack') {total += 10;}
        else if (c == 'Queen') {total += 10;}
        else if (c == 'King') {total += 10;}
        // else if card is not ace, parse int from non-face cards
        else if (c != 'Ace') {total += parseInt(c);}
        else if (c == 'Ace'){
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
function deal_one_card(deck){
    // Return a card object
    return deck.shift();
}


function get_hit_choice(){

} 


function play_player_hand(){

}


function play_dealer_hand(){

}

function check_bust(){

}


function check_win(){

}

function init(channel, client, userstate, startDeck=initDeck){
    var playerHand = []
    var dealerHand = []
    var gameActive = true;

    var deck = shuffle_deck(startDeck);

    display_deck(channel, client, deck);
    for (let i=0; i<2; i++){
        playerHand.push(deal_one_card(deck));
    }
    display_deck(channel, client, deck);

    display_hand(channel, client, userstate, 'you have', playerHand);
}






// Called every time a message comes in
function onMessageHandler (channel, userstate, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

    // If message doesnt start with a ! mark, ignore it
    if(!(commandName.startsWith('!'))) {return;}
    
    // If !blackjack
    else if (commandName === '!blackjack') {
    init(channel, client, userstate);
    console.log(`* Executed ${commandName} command`);
    }
    // Else log unknown !command
    else {
    console.log(`* Unknown command ${commandName}`);
    }
  }


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port} \n* On Channels: ${client.getOptions()['channels']}`);
}