// gameLoop.js
const { print } = require('./utils');
const { initializeInvestors } = require('./investors');
const { sourcing, getPlayerActions } = require('./playeractions');
const state = require('./state');
const { Investor, printInvestors } = require('./investors');
const { displayStartups, generateStartups, updateRaisingStartups } = require('./startups');
const { dealflowMeeting } = require('./dealflowmeeting');
const { initializePartners } = require('./partners');

async function initializePlayer() {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const playerName = await new Promise((resolve) => {
    rl.question('\nEnter your name: ', (answer) => {
      resolve(answer);
    });
  });

  const playerFund = await new Promise((resolve) => {
    rl.question('Enter the name of the fund you are joining: ', (answer) => {
      resolve(answer);
    });
  });

  rl.close();

  const playerExpertise = state.sectors.map(sector => ({
    sector: sector.name,
    expertise: 1 // Default initial expertise level for each sector
  }));

  const player = new Investor(playerName, playerFund, "non-partner", 5, playerExpertise);
  state.player = player;
  state.partners.push(player);

  // console.log("Player initialized:", state.player);
  // console.log("Player initialized with ID:", state.player.id); // Added this line for debugging
  // print(state.player.sectorExpertise)
}


async function gameLoop() {
  const maxTimePoints = 100; // Define the maximum time points available each week

  while (state.week <= 52) {
    console.log(`\n \n \nStarting Week ${state.week}`);
    state.timePoints = maxTimePoints; // Replenish time points at the start of each week
    await generateStartups(5); // Generate 5 new startups each week

    // Start dealflow meeting from week 2
    if (state.week >= 2) {
      await dealflowMeeting();
    }

    await getPlayerActions();

    if (state.timePoints === 0) {
      print("No more time points left for this week.");
      updateRaisingStartups();
      state.week++;
    // Exit the loop if no points are left
    }

  }
  console.log("Game over! You've completed one year.");
}


async function startGame() {
  await initializeInvestors();
  await initializePlayer();
  await initializePartners(); // Add this line
  await gameLoop();
}




module.exports = {startGame, gameLoop, initializePlayer};