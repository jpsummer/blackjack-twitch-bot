import Game from './game.js';

export default function Blackjack(channel, client, userstate, deck){
    
    Game.call(this, channel, client, userstate)
    this.player_hand = []
    this.dealer_hand = []
    this.deck = deck
}