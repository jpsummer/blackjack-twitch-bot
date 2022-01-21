import Game from './game.js';

export default function Blackjack(twitch, deck){

    Game.call(this, twitch)
    this.playerHand = []
    this.dealerHand = []
    this.dealerHidden = true;
    this.deck = deck
}