// actions.js
const { print, askQuestion } = require('./utils');
const { Startup, generateStartupName, generateStartupDescription, displayStartups } = require('./startups');
const state = require('./state');

async function getPlayerActions() {
    while (state.timePoints > 0) {
        print(`You have ${state.timePoints} time points remaining.`);
        let remainingPoints = state.timePoints;
        print(`\nDecide what you want to spend your time on this week, ${state.player.name} from ${state.player.fund}.`);
        const actions = [];

        const options = [
            "Sourcing new startups",
            "Research a startup",
            "Sector deepdive",
            "Networking"
        ];
        options.forEach((option, index) => {
            print(`${index + 1}. ${option}`);
        });

        let choice = parseInt(await askQuestion('\nEnter the number of your choice: '), 10);
        while (isNaN(choice) || choice < 1 || choice > options.length) {
            print("Invalid choice. Please enter a number from the list.");
            choice = parseInt(await askQuestion('Enter the number of your choice: '), 10);
        }

        if (choice !== 4) { // Exclude networking from upfront points allocation
            switch (choice) {
                case 1:
                    let points = await getPointsAllocation(); // New function to handle points allocation
                    await sourcing(points);
                    break;
                case 2:
                    let knownRaisingStartups = state.raisingStartups.filter(startup => startup.knowsOf.includes(state.player.id));
                    if (knownRaisingStartups.length === 0) {
                        print("No known startups. Please choose another option.");
                        continue; // Continue the loop, prompting the user to choose another option
                    }

                    // Filter startups to exclude all statuses except 'hot' initially
                    let startup = await selectStartup(['sourced', 'termSheets', 'passed', 'missed', 'portfolio'], true); // Exclude all except 'hot'
                    if (startup === "show_all") {
                        // If the player chooses to show all, call selectStartup again without filtering by status
                        startup = await selectStartup([], false);
                    }

                    if (startup) {
                        let points = await getPointsAllocation(); // Get points after selecting the startup
                        await researchStartup(startup, points);
                    }
                    break;
                case 3:
                    let sectorName = await selectSector(); // Ensure this is awaited and returns a valid sector
                    if (sectorName) {
                        let points = await getPointsAllocation(); // Get points after selecting the sector
                        await sectorDeepdive(sectorName, points);
                    }
                    break;
            }
        } else {
            await handleNetworking(); // Directly call handleNetworking
        }

        if (state.timePoints === remainingPoints) {
            print("No points were spent, ending the week.");
            break;
        }
    }
}

async function getPointsAllocation() {
    let points = parseInt(await askQuestion('Enter points to allocate: '), 10);
    while (isNaN(points) || points <= 0 || points > state.timePoints) {
        if (points > state.timePoints) {
            print(`Invalid points. You can only spend ${state.timePoints} time points.`);
        } else {
            print("Invalid points. Please enter a positive number.");
        }
        points = parseInt(await askQuestion('Enter points to allocate: '), 10);
    }
    return points;
}

async function selectStartup(excludeStatuses = [], showMore = false) {
    let eligibleStartups = state.raisingStartups.filter(startup => 
        startup.knowsOf.includes(state.player.id) &&
        !excludeStatuses.includes(startup.getCurrentPipelineStatus())
    );

    if (eligibleStartups.length === 0) {
        print("No eligible startups found.");
        return null;
    }

    displayStartups(state.player, excludeStatuses, eligibleStartups);

    if (showMore) {
        print(`${eligibleStartups.length + 1}. Show all\n\n\n---------------`);
    }

    let startupChoice = parseInt(await askQuestion('Enter the number of your choice: '), 10) - 1;
    while (isNaN(startupChoice) || startupChoice < 0 || startupChoice >= (showMore ? eligibleStartups.length + 1 : eligibleStartups.length)) {
        print("Invalid choice. Please select a valid number from the list.");
        startupChoice = parseInt(await askQuestion('Enter the number of your choice: '), 10) - 1;
    }

    if (showMore && startupChoice === eligibleStartups.length) {
        return "show_all";
    }

    return eligibleStartups[startupChoice];
}

async function selectSector() {
    print("\nSelect a sector for deepdive:\n");
    state.sectors.forEach((sector, index) => {
        print(`${index + 1}. ${sector.name}`);
    });

    let sectorChoice = parseInt(await askQuestion('\nEnter the number of your choice: '), 10) - 1;
    while (isNaN(sectorChoice) || sectorChoice < 0 || sectorChoice >= state.sectors.length) {
        print("Invalid choice. Please select a valid number from the list.");
        sectorChoice = parseInt(await askQuestion('\nEnter the number of your choice: '), 10) - 1;
    }

    return state.sectors[sectorChoice].name;
}

async function sourcing(points) {
  state.timePoints -= points;
  const numStartups = Math.floor(points / 10); // Example: 10 points per startup
  let knownStartups = 0;

  state.raisingStartups.forEach(startup => {
    if (Math.random() * 100 < points) {
      if (!startup.knowsOf.includes(state.player.id)) {
        startup.knowsOf.push(state.player.id);
        knownStartups++;
      }
      // Update pipeline status to 'sourced'
      if (startup.getCurrentPipelineStatus() === 'unknown') {
        startup.updatePipelineStatus('sourced');
      }
    }
  });

  print(`${knownStartups} new startups sourced.`);
}

async function researchStartup(startup, points) {
    state.timePoints -= points;
    print(`Researching ${startup.name} with ${points} points.`);

    // Ensure player expertise array is initialized and startup has a valid sector
    if (!state.player.sectorExpertise) {
        print("Missing player expertise data.");
        return;
    }
    if (!startup.sector) {
        print("Missing startup sector information.");
        return;
    }

    // Find player's expertise in the startup's sector
    const sectorExpertise = state.player.sectorExpertise.find(exp => exp.sector === startup.sector.name);

    if (!sectorExpertise) {
        print(`No expertise found for sector: ${startup.sector.name}`);
        return;
    }

    const playerExpertise = sectorExpertise.expertise;

    // Base chance for attribute revelation, multiplied by 100 for consistency
    const baseChance = 7; // Example base chance, now consistent with sourcing logic

    print(`Startup sector: ${startup.sector ? startup.sector.name : 'None'}`);
    print(`Sector expertise found: ${sectorExpertise ? 'Yes' : 'No'}`);

    // Calculate chance for each attribute
    Object.keys(startup.sectorKnowsOf).forEach(attribute => {
        const randomValue = Math.random() * 100;
        const chance = baseChance * points / startup.difficulty * playerExpertise;
        const success = randomValue < chance;
        print(`Attempting to reveal ${attribute}: ${chance.toFixed(2)}% chance. Result: ${success ? 'Success' : 'Failure'}`);
        if (!startup.sectorKnowsOf[attribute].includes(state.player.id)) {
            if (success) {
                startup.sectorKnowsOf[attribute].push(state.player.id);
                print(`Success! ${attribute} has been revealed: ${startup[attribute]}`);
            } else {
                print(`Failed to reveal ${attribute}.`);
            }
        }
    });
}

async function sectorDeepdive(sectorName, points) {
    state.timePoints -= points;
    print(`\nConducting a deepdive into ${sectorName} with ${points} points.`);

    let sectorExpertise = state.player.sectorExpertise.find(exp => exp.sector === sectorName);
    if (!sectorExpertise) {
        print(`No expertise found for sector: ${sectorName}`);
        return;
    }

    // Calculate the chance of increasing expertise based on current expertise and points spent
    const maxExpertise = 10; // Define the maximum expertise level
    const chanceOfIncrease = (maxExpertise - sectorExpertise.expertise) * points / (100 * maxExpertise);

    // Random chance to determine if expertise increases
    if (Math.random() < chanceOfIncrease) {
        sectorExpertise.expertise += 1; // Increase expertise by 1 step
        print(`Expertise in ${sectorName} increased to ${sectorExpertise.expertise}.`);
    } else {
        print(`No increase in expertise this time.`);
    }
}

async function handleNetworking() {
    print("\nWho do you want to network with?");
    print("1. Community");
    print("2. Specific investors");
    print("3. Partners in your firm");

    let networkChoice = parseInt(await askQuestion('\nEnter your choice: '), 10);
    while (isNaN(networkChoice) || networkChoice < 1 || networkChoice > 3) {
        print("Invalid choice. Please enter a number from the list.");
        networkChoice = parseInt(await askQuestion('\nEnter your choice: '), 10);
    }

    let points = parseInt(await askQuestion('Enter points to allocate: '), 10);
    while (isNaN(points) || points <= 0) {
        print("Invalid points. Please enter a positive number.");
        points = parseInt(await askQuestion('Enter points to allocate: '), 10);
    }

    switch (networkChoice) {
        case 1:
            await generalNetworking(points);
            break;
        case 2:
            await listAndSelectInvestor(points, false);
            break;
        case 3:
            await listAndSelectInvestor(points, true);
            break;
    }
}

async function listAndSelectInvestor(points, isPartner) {
    let investors = isPartner ? state.partners : state.investors.filter(inv => inv.relationship > 1);
    if (investors.length === 0) {
        print("No eligible investors found.");
        return;
    }

    investors.forEach((investor, index) => {
        print(`${index + 1}. ${investor.name} from ${investor.fund}, Relationship level: ${investor.relationship}`);
    });

    let investorChoice = parseInt(await askQuestion('Select an investor by number: '), 10) - 1;
    while (isNaN(investorChoice) || investorChoice < 0 || investorChoice >= investors.length) {
        print("Invalid choice. Please select a valid number from the list.");
        investorChoice = parseInt(await askQuestion('Select an investor by number: '), 10) - 1;
    }

    await oneToOneNetworking(investors[investorChoice].id, points);
}

async function generalNetworking(points) {
    state.timePoints -= points;
    print(`Conducting general networking using ${points} points.`);

    // Loop through a fixed number of 100 investors for potential relationship increase
    for (let i = 0; i < 100; i++) {
        const investor = state.investors[i % state.investors.length]; // Cycle through investors if less than 100
        const maxRelationship = 10; // Define the maximum relationship level
        const currentRelationship = investor.relationship;
        const chanceOfIncrease = ((maxRelationship - currentRelationship) * points / (120 * maxRelationship)); // 50% smaller chance

        if (Math.random() < chanceOfIncrease) {
            investor.relationship += 1;
            if (investor.relationship === 2) {
                print(`You had an introductory meeting with ${investor.name} from ${investor.fund}.`);
            } else {
                print(`Relationship level with ${investor.name} from ${investor.fund} increased to ${investor.relationship}.`);
            }
        }
    }
}

async function oneToOneNetworking(investorId, points) {
    state.timePoints -= points;
    const investor = state.investors.find(inv => inv.id === investorId);
    if (!investor) {
        print("Investor not found.");
        return;
    }

    const maxRelationship = 10;
    const currentRelationship = investor.relationship;
    const chanceOfIncrease = ((maxRelationship - currentRelationship) * points / (100 * maxRelationship));

    if (Math.random() < chanceOfIncrease) {
        investor.relationship += 1;
        print(`Relationship level with ${investor.name} increased to ${investor.relationship}.`);
    } else {
        print(`No increase in relationship with ${investor.name} this time.`);
    }
}

module.exports = { getPlayerActions, sourcing, researchStartup, sectorDeepdive, handleNetworking, generalNetworking, oneToOneNetworking, selectStartup };