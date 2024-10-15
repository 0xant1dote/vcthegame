const { print, askQuestion } = require('./functions/utils');
const { initializeInvestors, printInvestors, Investor } = require('./functions/investors'); // Added import for Investor
const { gameLoop, startGame, initializePlayer } = require('./functions/gameloop');
const state = require('./functions/state');
require('dotenv').config();
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);


startGame().catch(error => {
  console.error("Error starting the game:", error);
});