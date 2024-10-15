const state = require('./state'); // Ensure state is accessible for sector information

// Function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class Investor {
  static lastId = 0;

  constructor(name, fund, role, relationship, sectorExpertise, bio) {
    this.id = ++Investor.lastId; // Increment and assign a new ID
    this.name = name;
    this.fund = fund;
    this.role = role;
    this.relationship = relationship;
    this.sectorExpertise = sectorExpertise;
    this.knownStartups = []; // Initialize knownStartups for each investor
    this.bio = bio; // Initialize the biography of the investor
  }
}

// Function to initialize investors
function initializeInvestors() {
  state.investors = []; // Use the state's investors array directly
  const shuffledNames = shuffle([...state.investorNames]);
  const shuffledFunds = shuffle([...state.vcFunds]);

  if (shuffledFunds.length < 100) {
    throw new Error("Not enough unique funds available for 100 investors.");
  }

  for (let i = 0; i < 100; i++) {
    const name = shuffledNames[i % shuffledNames.length];
    const fund = shuffledFunds[i];
    const expertise = state.sectors.map(sector => ({
      sector: sector.name,
      expertise: Math.floor(Math.random() * 10) + 1
    }));
    state.investors.push(new Investor(name, fund, "non-partner", 1, expertise));
  }
  return state.investors;
}

function printInvestors() {
    state.investors.forEach(investor => {
        console.log(`ID: ${investor.id}, Name: ${investor.name}, Fund: ${investor.fund}, Role: ${investor.role}, Relationship: ${investor.relationship}`);
        console.log('Sector Expertise:');
        investor.sectorExpertise.forEach(expertise => {
            console.log(`  Sector: ${expertise.sector}, Expertise Level: ${expertise.expertise}`);
        });
    });
}

function initializePartners() {
    const partnerNames = ["Bob", "Jim", "Yana", "Tom", "Rene"];
    const playerFund = state.player.fund; // Assuming state.player has been initialized

    partnerNames.forEach(name => {
        const partner = new Investor(name, playerFund, "partner", 5, []);
        state.partners.push(partner);
    });
}













module.exports = { initializeInvestors, Investor, printInvestors};
