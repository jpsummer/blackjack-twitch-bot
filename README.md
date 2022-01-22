# Blackjack Bot

A blackjack twitch bot written in Javascript using Node.js



## Commands

| **!new**    | Starts a new blackjack game                                  |
| ----------- | ------------------------------------------------------------ |
| **!hit**    | **Draws a new card for the player**                          |
| **!stand**  | **Stands the players hand, then the dealer starts their phase of play** |
| **!status** | **Sends the player the current status of their blackjack game** |
| **!quit**   | **Deletes the current blackjack game so the player can start a new one** |
| **!help**   | **Sends the player basic information about the game and some commands** |



## Dependencies

- [tmi.js](https://github.com/tmijs/tmi.js) - Community built JS package makes it super easy to connect to and interact with Twitch IRC
- [dotenv](https://github.com/motdotla/dotenv) - Helps manage .env files
- [node-cleanup](https://github.com/jtlapp/node-cleanup) - Handles exit conditions for node processes

