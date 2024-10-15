// state.js
const { investorNames, vcFunds } = require('./data');
const state = {
  week: 1,
  timePoints: 100,
  startups: [],
  sectors: [
    { name: "Artificial Intelligence/Machine Learning", description: "AI and ML technologies.", trendFactor: 9 },
    { name: "FinTech (Financial Technology)", description: "Financial technology innovations.", trendFactor: 8 },
    { name: "HealthTech/MedTech", description: "Healthcare and medical technologies.", trendFactor: 7 },
    { name: "EdTech (Educational Technology)", description: "Educational technology solutions.", trendFactor: 6 },
    { name: "Clean Energy/CleanTech", description: "Clean and renewable energy technologies.", trendFactor: 8 },
    { name: "Cybersecurity", description: "Security technologies for digital protection.", trendFactor: 7 },
    { name: "E-commerce and Retail Tech", description: "Technologies for e-commerce and retail.", trendFactor: 6 },
    { name: "Autonomous Vehicles", description: "Self-driving and autonomous vehicle technologies.", trendFactor: 9 },
    { name: "Blockchain/Cryptocurrency", description: "Blockchain and cryptocurrency technologies.", trendFactor: 8 },
    { name: "AgTech (Agricultural Technology)", description: "Technologies for agriculture.", trendFactor: 5 },
    { name: "Space Technology", description: "Technologies for space exploration.", trendFactor: 7 },
    { name: "Robotics and Automation", description: "Robotic and automation technologies.", trendFactor: 8 },
    { name: "Augmented Reality/Virtual Reality (AR/VR)", description: "AR and VR technologies.", trendFactor: 6 },
    { name: "Internet of Things (IoT)", description: "Connected devices and IoT technologies.", trendFactor: 7 },
    { name: "Biotech and Life Sciences", description: "Biotechnology and life sciences.", trendFactor: 8 },
    { name: "Vertical SaaS (Software as a Service)", description: "Industry-specific SaaS solutions.", trendFactor: 6 },
    { name: "Quantum Computing", description: "Quantum computing technologies.", trendFactor: 9 },
    { name: "Gaming and Entertainment", description: "Technologies for gaming and entertainment.", trendFactor: 7 },
    { name: "FoodTech", description: "Technologies for food production and distribution.", trendFactor: 5 },
    { name: "PropTech (Property Technology)", description: "Technologies for real estate.", trendFactor: 6 }
],
  vcFunds,
  investorNames, 
  partners: [],
  playerReputation: 5,
  raisingStartups: [],
  investors: []
};

module.exports = state;