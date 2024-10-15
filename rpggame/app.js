document.addEventListener('DOMContentLoaded', function() {
    const startupsContainer = document.getElementById('startupsContainer');
    const timePointsSlider = document.getElementById('timePointsSlider');
    const investButton = document.getElementById('investButton');
    const investorNameInput = document.getElementById('investorName');
    const sourcingButton = document.getElementById('sourcingButton');
    const researchButton = document.getElementById('researchButton');
    const networkingButton = document.getElementById('networkingButton');
    require('dotenv').config();

    // Simulated startups data
    let startups = [
        { name: "Tech Innovate", sector: "AI" },
        { name: "Health Solution", sector: "HealthTech" }
    ];

    function displayStartups() {
        startupsContainer.innerHTML = '';
        startups.forEach((startup, index) => {
            const div = document.createElement('div');
            div.className = 'startup';
            div.textContent = `${startup.name} (${startup.sector})`;
            div.onclick = () => selectStartup(index);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = '50'; // Default value
            slider.className = 'slider';

            const sliderValue = document.createElement('span');
            sliderValue.textContent = slider.value; // Display the default slider value

            slider.oninput = function() {
                sliderValue.textContent = this.value;
            }

            div.appendChild(slider);
            div.appendChild(sliderValue);
            startupsContainer.appendChild(div);
        });
    }

    let selectedStartupIndex = null;

    function selectStartup(index) {
        if (selectedStartupIndex !== null) {
            startupsContainer.children[selectedStartupIndex].classList.remove('selected');
        }
        selectedStartupIndex = index;
        startupsContainer.children[index].classList.add('selected');
    }

    const investButton = document.createElement('button');
    investButton.textContent = 'Invest Timepoints';
    investButton.onclick = function() {
        if (selectedStartupIndex === null) {
            alert('Please select a startup first.');
            return;
        }
        const points = startupsContainer.children[selectedStartupIndex].querySelector('input').value;
        alert(`Investing ${points} points in ${startups[selectedStartupIndex].name}`);
        // Here you would typically call a backend API to update the game state
    };
    document.body.appendChild(investButton);

    sourcingButton.addEventListener('click', function() {
        const investorName = investorNameInput.value;
        // Implement sourcing logic here
        console.log(`Sourcing for ${investorName}`);
    });

    // Add similar event listeners for researchButton and networkingButton

    displayStartups();
});