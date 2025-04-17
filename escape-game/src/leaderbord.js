class Leaderboard {
    constructor() {
        this.times = [];
        this.loadTimes();
    }

    showPseudoPrompt(time, callback = null) {
        // Create the overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        // Create the prompt box
        const promptBox = document.createElement('div');
        promptBox.style.backgroundColor = '#222';
        promptBox.style.borderRadius = '10px';
        promptBox.style.padding = '20px';
        promptBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
        promptBox.style.textAlign = 'center';
        promptBox.style.maxWidth = '400px';
        promptBox.style.width = '80%';

        // Title
        const title = document.createElement('h2');
        title.textContent = 'Votre temps : ' + time;
        title.style.color = '#fff';
        title.style.marginBottom = '20px';

        // Message
        const message = document.createElement('p');
        message.textContent = 'Entrez votre pseudo pour sauvegarder votre temps';
        message.style.color = '#ccc';
        message.style.marginBottom = '15px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Votre pseudo';
        input.style.width = '100%';
        input.style.padding = '10px';
        input.style.marginBottom = '20px';
        input.style.backgroundColor = '#333';
        input.style.color = '#fff';
        input.style.border = '1px solid #555';
        input.style.borderRadius = '5px';
        input.style.outline = 'none';
        input.maxLength = 15;


        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirmer';
        confirmButton.style.padding = '10px 20px';
        confirmButton.style.backgroundColor = '#8B0000';
        confirmButton.style.color = '#fff';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '5px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.marginRight = '10px';

        // Add elements to the prompt box
        promptBox.appendChild(title);
        promptBox.appendChild(message);
        promptBox.appendChild(input);
        promptBox.appendChild(confirmButton);

        // add the prompt box to the overlay
        overlay.appendChild(promptBox);

        // add the overlay to the body
        document.body.appendChild(overlay);


        confirmButton.addEventListener('click', () => {
            const pseudo = input.value.trim() || 'Anonyme';
            this.addTime(pseudo, time);
            document.body.removeChild(overlay);
            if (callback) callback(pseudo);
        });

        // Key send information
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                confirmButton.click();
            }
        });
    }

    /**
     * converts a time in "MM:SS" format to seconds
     * @param {string} timeString - Time in "MM:SS" format
     * @returns {number} - Total number of seconds
     */
    timeToSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }

    /**
     * Adds a time entry to the leaderboard
     * @param {string} pseudo - The player's username
     * @param {string} time - The time obtained in "MM:SS" format
     */
    addTime(pseudo, time) {
        this.times.push({ pseudo, time, date: new Date().toISOString() });
        // Sort the times in ascending order
        this.times.sort((a, b) => this.timeToSeconds(a.time) - this.timeToSeconds(b.time));
        this.saveTimes();
    }

    //save the times in the localStorage
    saveTimes() {
        localStorage.setItem('escapeGameTimes', JSON.stringify(this.times));
    }

    // load from the localStorage
    loadTimes() {
        const savedTimes = localStorage.getItem('escapeGameTimes');
        this.times = savedTimes ? JSON.parse(savedTimes) : [];
    }

}

// Export a single instance of the Leaderboard class
const leaderboard = new Leaderboard();

export default leaderboard;
