import Game from './game.js';

export default function Blackjack(channel, client, userstate, deck){

    Game.call(this, channel, client, userstate)
    this.playerHand = []
    this.dealerHand = []
    this.deck = deck
}