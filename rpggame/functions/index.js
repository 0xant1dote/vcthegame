// index.js
const { startGame } = require('./gameloop');

startGame().catch(error => {
  console.error("Error starting the game:", error);
});