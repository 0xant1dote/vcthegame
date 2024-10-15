const { askLLM } = require('./LLM');
const { Investor } = require('./investors');
const state = require('./state');

class Partner extends Investor {
    constructor(name, fund, role, relationship, sectorExpertise, bio, sectorOwnership, quirks, mood) {
        super(name, fund, role, relationship, sectorExpertise);
        this.bio = bio;
        this.sectorExpertise = sectorExpertise.map(sector => ({ sector, expertise: 5 })); // Assuming a default expertise level of 5
        this.sectorOwnership = sectorOwnership; // New property for sector ownership
        this.quirks = quirks; // New property for quirks
        this.mood = mood; // New property for mood
    }
}

function initializePartners() {
    const partnerData = [
        { 
            name: "Rana", 
            bio: "Your name is Rana, you are a funny, but intense woman who worked at Goldman before and now are working for a VC fund.",
            expertise: ["FinTech (Financial Technology)", "Artificial Intelligence/Machine Learning"],
            sectorOwnership: ["FinTech (Financial Technology)", "Artificial Intelligence/Machine Learning, Quantum Computing, FoodTech"],
            quirks: ["funny", "intense"],
            mood: "neutral"
        },
        { 
            name: "James", 
            bio: "Your name is James, you are a sophisticated VC investor. You previously studied at Oxford. You are very intellectual.",
            expertise: ["EdTech (Educational Technology)", "Blockchain/Cryptocurrency"],
            sectorOwnership: ["EdTech (Educational Technology)", "Blockchain/Cryptocurrency", "PropTech (Property Technology), HealthTech/MedTech, AgTech (Agricultural Technology)"],
            quirks: ["you like mentioning how you have read a study that is related to the startup being mentioned", "you like comparing startups with the current political situation in the UK"],
            mood: "neutral"
        },
        { 
            name: "Rob", 
            bio: "Your name is Rob. You are a highly analytical investor. You are hard working and basically only invest based on KPIs.",
            expertise: ["Cybersecurity", "Vertical SaaS (Software as a Service)"],
            sectorOwnership: ["Cybersecurity", "Vertical SaaS (Software as a Service), Autonomous Vehicles, Augmented Reality/Virtual Reality (AR/VR), Gaming and Entertainment"],
            quirks: ["You like ending sentences with - great stuff ", "you like responding with - great stuff"],
            mood: "neutral"
        },
        { 
            name: "Tim", 
            bio: "Your name is Tim. You are an old VC investor who has been in the industry for decades. It is impossible for you to talk without talking about or comparing things with anecdote where you have invested in a similar startup in the 1990s / 2000s",
            expertise: ["Clean Energy/CleanTech", "Space Technology"],
            sectorOwnership: ["Clean Energy/CleanTech", "Space Technology"],
            quirks: ["whenever a startup is mentioned, you like to comppare it with an anecdote of a similar startup you have invested in in the 1980s", "nostalgic", "you like talking about horse betting, like the horses you bet on last weekend"],
            mood: "neutral"
        },
        { 
            name: "Bernard", 
            bio: "Your name is Bernard. You are a successful entrepreneur who exited a startup for billions and now run a VC.",
            expertise: ["E-commerce and Retail Tech", "Robotics and Automation"],
            sectorOwnership: ["E-commerce and Retail Tech", "Robotics and Automation, Internet of Things (IoT), Biotech and Life Sciences"],
            quirks: ["You speak a language mix of French and English"],
            mood: "neutral"
        }
    ];

    partnerData.forEach(data => {
        const sectorExpertise = data.expertise.map(sector => ({
            sector: sector,
            expertise: 5 // Default expertise level
        }));
        const partner = new Partner(data.name, state.player.fund, "partner", 5, sectorExpertise, data.bio, data.sectorOwnership, data.quirks, data.mood);
        state.partners.push(partner);
    });
}

function partnersDecisions(startup) {
    const allAttributes = ['marketSize', 'team', 'traction', 'competition', 'product'];
    
    return state.partners.map(partner => {
        const knownAttributes = allAttributes.filter(attr => 
            startup.sectorKnowsOf[attr].includes(state.player.id)
        );

        let totalScore = 0;
        knownAttributes.forEach(attr => {
            totalScore += startup[attr];
        });

        // Calculate average score
        let interestScore = knownAttributes.length > 0 ? totalScore / knownAttributes.length : 0;

        // Number of attributes partner wants to see based on relationship
        const desiredAttributesCount = Math.min(5, Math.max(1, 6 - Math.floor(partner.relationship / 2)));

        // Randomly select desired attributes
        const desiredAttributes = shuffle(allAttributes).slice(0, desiredAttributesCount);

        // Adjust thresholds for different outcomes
        const learnMoreThreshold = 5;
        const investThreshold = 8;

        let decision;
        if (knownAttributes.length < desiredAttributesCount) {
            decision = "wants to learn more";
        } else if (interestScore < learnMoreThreshold) {
            decision = "not interested";
        } else if (interestScore >= learnMoreThreshold && interestScore < investThreshold) {
            decision = "wants to learn more";
        } else {
            decision = "wants to invest";
        }

        return {
            partner: partner.name,
            decision,
            interestScore,
            knownAttributes: knownAttributes.length,
            desiredAttributes,
            desiredAttributesCount
        };
    });
}

// Add this shuffle function at the top of the file if it's not already there
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function selectPartner() {
  const nonPlayerPartners = state.partners.filter(p => p.id !== state.player.id);
  
  if (nonPlayerPartners.length === 0) {
    console.log("No non-player partners available for the dealflow meeting.");
    return null;
  }

  const randomPartnerIndex = Math.floor(Math.random() * nonPlayerPartners.length);
  return nonPlayerPartners[randomPartnerIndex];
}

async function partnerOpensDealflowMeeting(partner) {
    const randomQuirk = partner.quirks[Math.floor(Math.random() * partner.quirks.length)];
    const llmPrompt = `You are ${partner.name} from ${state.player.fund}. Your job is to start the dealflow meeting (no need to say your name though). You should say hello everyone. Behave according to your bio: ${partner.bio}. Your current mood is ${partner.mood}. Also, incorporate this quirk into your greeting: ${randomQuirk}.`
    const greeting = await askLLM(llmPrompt);
    return `\n${partner.name}: "${greeting}"\n`;
}

module.exports = { initializePartners, Partner, partnersDecisions, selectPartner, partnerOpensDealflowMeeting };