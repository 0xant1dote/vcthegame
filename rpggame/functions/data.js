

// Variables
const gameConfig = {
  maxTimePoints: 100, //number of timepoints that are spent every week
  baseChance: 7,
  sourcingPointsPerStartup: 10, 
  fundraisingProbability: 0.2,
  termSheetSuccessProbability: 0.7,
  expertiseIncreaseChanceFactor: 100,
  maxExpertise: 10,
  maxRelationship: 10,
  generalNetworkingChanceFactor: 120,
  oneToOneNetworkingChanceFactor: 100
};


// List of investor names
const investorNames = [
        "Ethan Thompson", "Liam Chen", "Julian Styles", "Lucas Brooks", "Caleb Patel", "Alexander Lee", "Gabriel Hall", "Michael Kim", "Christopher Wong", "Benjamin Brown",
        "Ryan Taylor", "Owen Mitchell", "Logan Pierce", "Gavin Reed", "Cameron Foster", "Harrison Lane", "Parker Grant", "Cooper Davis", "Tyler James", "Austin Martin",
        "Ava Moreno", "Sophia Patel", "Mia Kim", "Isabella Lee", "Charlotte Hall", "Abigail Chen", "Emily Wong", "Hannah Brown", "Julia Styles", "Lily Taylor",
        "Zoey Mitchell", "Maya Pierce", "Ruby Foster", "Ava Lane", "Sydney Grant", "Kennedy Davis", "Jasmine Martin", "Tessa James", "Alexandra Brooks", "Gabriella Thompson",
        "Jackson Reed", "Lillian Brooks", "Ethan Patel", "Ruby Singh", "Julianne Taylor", "Caleb Foster", "Ava Moreno", "Logan Kim", "Sophia Hall", "Michael Chen",
        "Maya Styles", "Harrison Brown", "Emily Wong", "Cooper Lee", "Abigail Pierce", "Tyler Mitchell", "Gavin Martin", "Julia Davis", "Kennedy James", "Tessa Grant",
        "Alexander Lane", "Lily Patel", "Jackson Brooks", "Ruby Taylor", "Ethan Foster", "Sophia Kim", "Julianne Hall", "Caleb Brown", "Ava Singh", "Logan Lee",
        "Michael Styles", "Harrison Pierce", "Emily Foster", "Cooper Martin", "Abigail Davis", "Tyler Grant", "Gavin James", "Julia Lane", "Kennedy Taylor", "Tessa Brooks",
        "Alexander Patel", "Lily Kim", "Jackson Hall", "Ruby Singh", "Ethan Lee", "Sophia Foster", "Julianne Pierce", "Caleb Davis", "Ava Martin", "Logan Grant",
        "Michael Brooks", "Harrison Taylor", "Emily Lane", "Cooper Singh", "Abigail Kim", "Tyler Patel", "Gavin Foster", "Julia Hall", "Kennedy Lee", "Tessa Martin"
      ];
  
  // List of venture capital funds
  const vcFunds = [
    "Andreessen Borewitz", "Redwood Capital", "Bigger Gherkins", "Decel Partners", "Greenlock Partners",
    "Coleslaw Ventures", "Old Enterprise Associates (OEA)", "Finders Fund", "Outsight Partners", "Appendix Ventures",
    "Bessy Venture Partners", "50x", "Specific Catalyst", "Solar Ventures", "Womenlo Ventures",
    "Cantaloupe Partners", "Matrix Reloaded Partners", "Ember Capital", "LastMark Capital", "RRR Ventures",
    "Circle Square Ventures", "Southwest Venture Partners", "JuneField Fund", "Ruby Ventures", "Elevenaya Capital",
    "Valley Partners", "Lowland Capital Partners", "North Star Partners", "RockVen", "TGT Capital (Two Gs Transposed)",
    "84South", "Fuller-ton Capital", "Draper Fisher Netson", "Swimbridge Capital Partners", "Roof Capital",
    "Tiny Bump Partners", "Whitecroft Partners", "L.O.W. Growth Partners", "MVP (Mythical Venture Partners)", "JMO Equity",
    "KKRunch", "Matrix Hong Kong", "Old Pacific Ventures", "South Tunnel Venture Partners", "Mangopit Venture Capital",
    "Qualms Ventures", "Weigh Venture Partners", "So-so-finnova Partners", "Bident Capital", "Duality Ventures",
    "USBP (United States Business Partners)", "Wellington Boots Partners", "Flap Venture Capital", "WRWI Capital",
    "YZ Ventures", "501 Startups", "Eve Avenue Partners", "AllegisVirus", "Beethoven Capital Partners", "Anthem-less Group",
    "Dolphin Technology Growth", "Prospective Ventures", "BTW Partners", "C Capital Group", "C6 Capital",
    "Crisco Investments", "Bell Technologies Capital", "DCMV Ventures", "Nine Roads Ventures", "Submergence Capital",
    "Beginningya Partners", "Eniac Ventures 2.0", "EQQ Ventures", "F-Subprime Capital", "Oscar Capital",
    "Final Round Capital", "Afterburner Ventures", "Founders Square Capital", "G3VP", "Gain-demons", "Lowland Europe",
    "Emoji Ventures", "Outsight Venture Partners", "Extel Capital", "Preventus Capital Partners", "TP Group",
    "Hop Capital", "Cat9 Ventures", "L Doggerton", "Liberty Local Ventures", "Slowspeed India Partners",
    "Marsbuck Investments", "Matrix Reloaded India", "Medi-low-tech Venture Partners", "Meri-mediocre-tech Capital Partners",
    "Berlin Venture Partners", "LastEquity Partners", "NGPi Capital", "Omidnight Network", "Hoot Ventures",
    "Sequoia Capital", "Benchmark", "Greylock Partners", "Accel", "Lightspeed Venture Partners",
    "Union Square Ventures", "Index Ventures", "Bessemer Venture Partners", "Kleiner Perkins", "GV (Google Ventures)",
    "Insight Partners", "General Catalyst", "Battery Ventures", "IVP (Institutional Venture Partners)", "NEA (New Enterprise Associates)",
    "Andreessen Horowitz", "SoftBank Vision Fund", "Tiger Global Management", "Coatue Management", "Thrive Capital",
    "Founders Fund", "First Round Capital", "True Ventures", "UpWest Labs", "500 Startups",
    "Y Combinator", "Techstars", "SOSV", "Plug and Play", "Dreamit Ventures",
    "NextView Ventures", "Slow Ventures", "Forerunner Ventures", "Aspect Ventures", "Canvas Ventures",
    "Menlo Ventures", "Norwest Venture Partners", "Redpoint Ventures", "Scale Venture Partners", "Sapphire Ventures"
  ];
 
module.exports = { investorNames, vcFunds, gameConfig };

  