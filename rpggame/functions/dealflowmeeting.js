const { print, askQuestion } = require('./utils');
const { askLLM } = require('./LLM');
const state = require('./state');
const { selectStartup } = require('./playeractions');
const { selectPartner, partnerOpensDealflowMeeting, partnersDecisions } = require('./partners');
const { displayAndSelectStartups } = require('./startups');
require('dotenv').config();

async function dealflowMeeting() {
    displayPipeline();
    const partner = selectPartner();
    if (!partner) {
        console.log("No non-player partners available for the dealflow meeting.");
        return;
    }

    const openingStatement = await partnerOpensDealflowMeeting(partner);
    print(openingStatement);

    // Discuss startups in the termSheets pipeline
    const startupsWithTermSheets = state.raisingStartups.filter(startup => 
        startup.pipeline[startup.pipeline.length - 1] === 'termSheets'
    );

    for (const startup of startupsWithTermSheets) {
        const interestedPartner = findInterestedPartner(startup);
        if (interestedPartner) {
            print(`${partner.name}: Any updates on ${startup.name} that we've given a term sheet to?`);
            print(`${interestedPartner.name}: We're still waiting to hear back from ${startup.name}. I'll keep everyone updated when we receive a response.`);
        }
    }

    // Go through the hot pipeline
    const hotStartups = state.raisingStartups.filter(startup => 
        startup.pipeline[startup.pipeline.length - 1] === 'hot'
    );

    for (const startup of hotStartups) {
        const sectorPartner = findSectorPartner(startup.sector.name);
        if (sectorPartner) {
            const updateQuestion = `Any updates on ${startup.name} in the ${startup.sector.name} sector?`;
            print(`${sectorPartner.name}: ${updateQuestion}`);
            
            const hasUpdates = await askQuestion("Do you have any updates? (yes/no): ");
            if (hasUpdates.toLowerCase() === 'yes') {
                await handleStartupUpdate(startup, sectorPartner);
            } else {
                print(`${sectorPartner.name}: Alright, let's move on to the next startup.`);
            }
        }
    }

    // Ask if there are any new startups to pitch
    const hasNewStartups = await askQuestion("\n------------\nDo you have any new startups to pitch? (yes/no):\n\n\n ");
    if (hasNewStartups.toLowerCase() === 'yes') {
        await pitchNewStartup();
    }

    print("\n\n---------------\nDealflow meeting concluded.\n---------------\n\n");
}

function findSectorPartner(sectorName) {
    return state.partners.find(partner => 
        partner.sectorOwnership && 
        partner.sectorOwnership.some(ownership => 
            ownership.toLowerCase().includes(sectorName.toLowerCase()) ||
            sectorName.toLowerCase().includes(ownership.toLowerCase())
        )
    );
}

async function handleStartupUpdate(startup, sectorPartner) {
    const newlyDiscoveredAttributes = [];
    const allAttributes = ['marketSize', 'team', 'traction', 'competition', 'product'];
    
    allAttributes.forEach(attr => {
        if (startup.sectorKnowsOf[attr].includes(state.player.id) && 
            !startup.sectorKnowsOf[attr].includes(sectorPartner.id)) {
            newlyDiscoveredAttributes.push(attr);
            startup.sectorKnowsOf[attr].push(sectorPartner.id);
        }
    });

    if (newlyDiscoveredAttributes.length > 0) {
        const updates = `New information discovered about ${newlyDiscoveredAttributes.join(', ')}.`;
        print(`You: ${updates}`);
        
        const decision = partnersDecisions(startup).find(d => d.partner === sectorPartner.name);
        if (decision) {
            const responsePrompt = `${sectorPartner.name} from ${state.player.fund} responding to updates on ${startup.name} in ${startup.sector.name}: 
            The player provided the following update: "${updates}"
            Please provide your thoughts on this update. Your response should reflect the following decision: "${decision.decision}".
            If the decision is "wants to learn more", express cautious interest and mention that you would need at least more information about ${decision.desiredAttributes.join(' and ')}.
            If the decision is "wants to invest", express how you want to invest into the startup. Also say the specific reason what excites you about the startup. 
            If the decision is "not interested", politely explain why you're passing on this opportunity.
            Base your excitement level on the interest score of ${decision.interestScore.toFixed(2)}.
            No need to introduce yourself or mention your fund's name. Never mention your interest score.`;
            
            const response = await askLLM(responsePrompt);
            print(`${sectorPartner.name}: "${response}"`);

            updatePipeline(startup, decision.decision);
        }
    } else {
        print(`No new information to share about ${startup.name}.`);
    }
}

async function pitchNewStartup() {
    const selectedStartup = await displayAndSelectStartups(state.player, ['hot', 'termSheets', 'passed', 'missed'], true, false);
    if (!selectedStartup) {
        print("You have no startups to pitch or an invalid selection was made.");
        return;
    }
    
    const sectorPartner = findSectorPartner(selectedStartup.sector.name);
    if (sectorPartner) {
        console.log(`Sector partner found: ${sectorPartner.name}`);
        const decision = partnersDecisions(selectedStartup).find(d => d.partner === sectorPartner.name);
        if (decision) {
            const quirks = sectorPartner.quirks ? sectorPartner.quirks.join('. ') : '';
            const responsePrompt = `${sectorPartner.name} from ${state.player.fund} on ${selectedStartup.name} in ${selectedStartup.sector.name}: 
            Please provide your thoughts on this startup. Your response should reflect the following decision: "${decision.decision}".
            If the decision is "wants to learn more", express cautious interest and mention that you would need at least more information about ${decision.desiredAttributes.join(' and ')}.
            If the decision is "wants to invest", express how you want to invest into the startup. Also say the specific reason what excites you. About the startup. 
            If the decision is "not interested", politely explain why you're passing on this opportunity.
            Base your excitement level on the interest score of ${decision.interestScore.toFixed(2)}.
            No need to introduce yourself or mention your fund's name. Never mention your interest score. 
            Please incorporate some or all of your quirks into your response: ${quirks}`;
            const response = await askLLM(responsePrompt);
            print(`${sectorPartner.name}: "${response}"`);

            print(`\n${decision.partner}'s decision: ${decision.decision}`);
            print(`Interest Score: ${decision.interestScore.toFixed(2)}`);
            print(`Known Attributes: ${decision.knownAttributes}`);
            print(`Desired Attributes: ${decision.desiredAttributes && Array.isArray(decision.desiredAttributes) ? decision.desiredAttributes.join(', ') : 'None'} (${decision.desiredAttributesCount})`);

            // Update pipeline based on decision
            updatePipeline(selectedStartup, decision.decision);
        }
    } else {
        print("No partner is interested in this sector.");
    }
}

function updatePipeline(startup, decision) {
  switch (decision) {
    case "wants to learn more":
      startup.updatePipelineStatus('hot');
      break;
    case "wants to invest":
      startup.updatePipelineStatus('termSheets');
      break;
    case "not interested":
      startup.updatePipelineStatus('passed');
      break;
  }
}

function displayPipeline() {
    const raisingStartups = state.raisingStartups;
    if (!raisingStartups || raisingStartups.length === 0) {
        console.log("No startups are currently raising.");
        return;
    }

    const pipeline = {
        sourced: [],
        hot: [],
        termSheets: [],
        passed: [],
        missed: []
    };

    raisingStartups.forEach(startup => {
        if (startup.knowsOf.includes(state.player.id)) {
            const currentStatus = startup.getCurrentPipelineStatus();
            if (pipeline.hasOwnProperty(currentStatus)) {
                pipeline[currentStatus].push(startup);
            }
        }
    });

    const maxLength = Math.max(
        ...Object.values(pipeline).map(arr => arr.length)
    );

    console.log("\nDealflow Pipeline:\n");
    console.log("Sourced      | Hot          | TermSheets   | Passed       | Missed");
    console.log("-------------|--------------|--------------|--------------|------------");

    for (let i = 0; i < maxLength; i++) {
        let line = "";
        line += formatName(pipeline.sourced[i]?.name, 13);
        line += "| " + formatName(pipeline.hot[i]?.name, 12);
        line += " | " + formatName(pipeline.termSheets[i]?.name, 12);
        line += " | " + formatName(pipeline.passed[i]?.name, 12);
        line += " | " + formatName(pipeline.missed[i]?.name, 12);
        console.log(line);
    }
    console.log("\n");
}

function formatName(name, maxLength) {
    if (!name) return " ".repeat(maxLength);
    if (name.length > maxLength) {
        return name.substring(0, maxLength - 3) + "...";
    }
    return name.padEnd(maxLength);
}

function findInterestedPartner(startup) {
    const interestedPartner = state.pipeline.termSheets.find(s => s.name === startup.name);
    if (interestedPartner) {
        return interestedPartner.interestedPartner;
    }
    return null;
}

module.exports = { dealflowMeeting, displayPipeline };