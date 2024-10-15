// startups.js
const state = require('./state');
const axios = require('axios');
const { print, askQuestion } = require('./utils');
const { askLLM } = require('./LLM');


class Startup {
  constructor(name, description, sector) {
    this.name = name;
    this.description = description;
    this.sector = sector;
    this.marketSize = Math.floor(Math.random() * 10) + 1; // Range 1-10
    this.team = Math.floor(Math.random() * 10) + 1;
    this.traction = Math.floor(Math.random() * 10) + 1;
    this.competition = Math.floor(Math.random() * 10) + 1;
    this.product = Math.floor(Math.random() * 10) + 1;
    this.difficulty = Math.floor(Math.random() * 10) + 1;
    this.sectorKnowsOf = {
      marketSize: [],
      team: [],
      traction: [],
      competition: [],
      product: []
    };
    this.weeksRaising = 0;
    this.status = 'raising';
    this.knowsOf = [];
    this.hasBeenPitched = false;
    this.pipeline = ['unknown']; // Initialize pipeline as a list with 'unknown' status
    this.termsheets = []; // List of term sheets with fund name and week number
    this.investor = []; // List of investors
  }

  updatePipelineStatus(newStatus) {
    if (['unknown', 'sourced', 'hot', 'termSheets', 'passed', 'missed', 'portfolio'].includes(newStatus)) {
      this.pipeline.push(newStatus);
    } else {
      console.error(`Invalid pipeline status: ${newStatus}`);
    }
  }

  getCurrentPipelineStatus() {
    return this.pipeline[this.pipeline.length - 1];
  }

  revealStartupAttribute(attribute, investorId) {
    if (this.hasOwnProperty(attribute)) {
      this.sectorKnowsOf[attribute].push(investorId);
      console.log(`Investor ${investorId} revealed ${attribute}: ${this[attribute]}`);
    }
  }

  develop() {
    // Logic for startup development
  }
}

async function generateStartupName(sector) {
  try {
    const prompt = `Generate a startup name in the sector ${sector}. Make the name sound catchy and cool:`;
    const name = await askLLM(prompt);
    return name || "Default Startup Name"; // Fallback name if the response is empty
  } catch (error) {
    return "Default Startup Name"; // Fallback name without logging the error
  }
}

async function generateStartupDescription(name, sector) {
  try {
    const prompt = `Generate a description for a startup named ${name} in the sector ${sector}. Make the description short and succinct and focus on the sector the company builds in, what the product does and a specific reason why and how it differentiates itself. The description should be in third-person:`;
    const description = await askLLM(prompt);
    return description || "Default Startup Description"; // Fallback description if the response is empty
  } catch (error) {
    return "Default Startup Description"; // Fallback description without logging the error
  }
}

async function generateStartups(numStartups) {
  for (let i = 0; i < numStartups; i++) {
    let sector = state.sectors[Math.floor(Math.random() * state.sectors.length)];
    let name = await generateStartupName(sector.name);
    let description = await generateStartupDescription(name, sector.name);
    let newStartup = new Startup(name, description, sector);
    state.raisingStartups.push(newStartup); // Add to raisingStartups instead of startups
  }
}

function checkFundraisingStatus(startup) {
  
  // Calculate the probability of finishing fundraising
  // The probability increases each week, with an average of 5 weeks
  const probability = 0.2
  
  if (Math.random() < probability) {
    startup.status = 'finished';
    return true;
  }
  return false;
}

function updateRaisingStartups() {
  for (let i = state.raisingStartups.length - 1; i >= 0; i--) {
    let startup = state.raisingStartups[i];
    if (checkFundraisingStatus(startup)) {
      const currentStatus = startup.getCurrentPipelineStatus();
      
      if (currentStatus === 'termSheets') {
        if (Math.random() < 0.7) { // 70% chance of success
          startup.updatePipelineStatus('portfolio');
          print(`${startup.name} has successfully closed and joined your portfolio!`);
        } else {
          startup.updatePipelineStatus('passed');
          print(`${startup.name} has finished fundraising but didn't close with your fund.`);
        }
      } else if (currentStatus !== 'passed' && currentStatus !== 'portfolio') {
        startup.updatePipelineStatus('missed');
        print(`${startup.name} has finished fundraising without your involvement.`);
      }
      
      // Move to finished startups list if not in portfolio
      if (startup.getCurrentPipelineStatus() !== 'portfolio') {
        state.startups.push(startup);
      }
      
      // Remove from raisingStartups list
      state.raisingStartups.splice(i, 1);
    }
  }
}

async function displayAndSelectStartups(investor, excludeStatuses = [], allowSelection = false, showMore = false) {
    let knownRaisingStartups = state.raisingStartups.filter(startup => {
        const currentStatus = startup.getCurrentPipelineStatus();
        return startup.knowsOf.includes(investor.id) && !excludeStatuses.includes(currentStatus);
    });

    if (knownRaisingStartups.length > 0) {
        knownRaisingStartups.forEach((startup, index) => {
            let attributes = [
                `Market Size: ${startup.sectorKnowsOf.marketSize.includes(investor.id) ? startup.marketSize : '?'}`,
                `Team: ${startup.sectorKnowsOf.team.includes(investor.id) ? startup.team : '?'}`,
                `Traction: ${startup.sectorKnowsOf.traction.includes(investor.id) ? startup.traction : '?'}`,
                `Competition: ${startup.sectorKnowsOf.competition.includes(investor.id) ? startup.competition : '?'}`,
                `Product: ${startup.sectorKnowsOf.product.includes(investor.id) ? startup.product : '?'}`,
                `\n\nDescription: ${startup.description}\n\n`,
                `Status: ${startup.status}`,
                `Weeks Raising: ${startup.weeksRaising}`,
                `Difficulty: ${startup.difficulty}`,
                `Current Pipeline Status: ${startup.getCurrentPipelineStatus()}`,
                `Pipeline History: ${startup.pipeline.join(' -> ')}`
            ].join(', ');
            print(`${index + 1}. ${startup.name} (${startup.sector.name}) - ${attributes}`);
            print("--------------------\n")
        });

        if (allowSelection) {
            if (showMore) {
                print(`${knownRaisingStartups.length + 1}. Show all\n\n\n---------------`);
            }

            let startupChoice = parseInt(await askQuestion('Enter the number of your choice: '), 10) - 1;
            while (isNaN(startupChoice) || startupChoice < 0 || startupChoice >= (showMore ? knownRaisingStartups.length + 1 : knownRaisingStartups.length)) {
                print("Invalid choice. Please select a valid number from the list.");
                startupChoice = parseInt(await askQuestion('Enter the number of your choice: '), 10) - 1;
            }

            if (showMore && startupChoice === knownRaisingStartups.length) {
                return "show_all";
            }

            return knownRaisingStartups[startupChoice];
        }
    } else {
        print("No raising startups known to this investor or all known startups are excluded.");
    }

    return null;
}

function displayStartups(investor, excludeStatuses = []) {
   
  /*print("\n\n\nRaising Startups Known to Investor:\n");
    // Ensure excludeStatuses is an array
    excludeStatuses = Array.isArray(excludeStatuses) ? excludeStatuses : [];
    
    // Debugging: Print excludeStatuses
    console.log("Exclude Statuses:", excludeStatuses); */

    let knownRaisingStartups = state.raisingStartups.filter(startup => {
        const currentStatus = startup.getCurrentPipelineStatus();
        
        // Debugging: Print current status of each startup
        // console.log(`Startup: ${startup.name}, Current Status: ${currentStatus}`);
        
        return startup.knowsOf.includes(investor.id) && !excludeStatuses.includes(currentStatus);
    });

    if (knownRaisingStartups.length > 0) {
        knownRaisingStartups.forEach((startup, index) => {
            let attributes = [
                `Market Size: ${startup.sectorKnowsOf.marketSize.includes(investor.id) ? startup.marketSize : '?'}`,
                `Team: ${startup.sectorKnowsOf.team.includes(investor.id) ? startup.team : '?'}`,
                `Traction: ${startup.sectorKnowsOf.traction.includes(investor.id) ? startup.traction : '?'}`,
                `Competition: ${startup.sectorKnowsOf.competition.includes(investor.id) ? startup.competition : '?'}`,
                `Product: ${startup.sectorKnowsOf.product.includes(investor.id) ? startup.product : '?'}`,
                `\n\nDescription: ${startup.description}\n\n`,
                `Status: ${startup.status}`,
                `Weeks Raising: ${startup.weeksRaising}`,
                `Difficulty: ${startup.difficulty}`,
                `Current Pipeline Status: ${startup.getCurrentPipelineStatus()}`,
                `Pipeline History: ${startup.pipeline.join(' -> ')}`
            ].join(', ');
            print(`${index + 1}. ${startup.name} (${startup.sector.name}) - ${attributes}`);
            print("--------------------\n")
        });
    } else {
        print("No raising startups known to this investor or all known startups are excluded.");
    }
}

module.exports = { Startup, generateStartupName, generateStartupDescription, updateRaisingStartups, displayStartups, generateStartups, displayAndSelectStartups };