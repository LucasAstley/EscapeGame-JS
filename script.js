document.addEventListener('DOMContentLoaded', function () {
    const imageContainers = document.querySelectorAll('.image-container');
    const infoBox = document.getElementById('infoBox');
    const gamesContainer = document.querySelector('.games-container');
    const leaderBoard = document.querySelector('.leaderboard-btn');
    let activeContainer = null;

    imageContainers.forEach(container => {
        container.addEventListener('click', function () {
            if (!this.classList.contains('active')) return;

            if (infoBox.classList.contains('active')) {
                infoBox.classList.remove('active');
                setTimeout(() => {
                    infoBox.style.display = 'none';
                    gamesContainer.appendChild(infoBox);
                }, 300);

                if (activeContainer === this) {
                    activeContainer = null;
                    return;
                }
            }

            activeContainer = this;

            let nextElement = this.nextElementSibling;

            if (nextElement) {
                gamesContainer.insertBefore(infoBox, nextElement);
            } else {
                gamesContainer.appendChild(infoBox);
            }

            infoBox.style.display = 'block';
            setTimeout(() => {
                infoBox.classList.add('active');
            }, 10);
        });
    });

    leaderBoard.addEventListener('click', function() {
        showLeaderboard()
    })

    function showLeaderboard() {
        const savedTimes = localStorage.getItem('escapeGameTimes');
        let times = savedTimes ? JSON.parse(savedTimes) : [];

        // Sort the times in descending order
        times.sort((time1, time2) => {
            // convert time strings to seconds for comparison
            const getSeconds = (timeStr) => {
                const [minutes, seconds] = timeStr.split(':').map(Number);
                return minutes * 60 + seconds;
            };
            // return the difference between the two times
            return getSeconds(time2.time) - getSeconds(time1.time);
        });

        // overlay for the leaderboard
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

        // leaderboard box
        const leaderboardBox = document.createElement('div');
        leaderboardBox.style.backgroundColor = '#222';
        leaderboardBox.style.borderRadius = '10px';
        leaderboardBox.style.padding = '20px';
        leaderboardBox.style.boxShadow = '0 0 20px rgba(0, 102, 204, 0.5)';
        leaderboardBox.style.textAlign = 'center';
        leaderboardBox.style.maxWidth = '500px';
        leaderboardBox.style.width = '90%';
        leaderboardBox.style.maxHeight = '80vh';
        leaderboardBox.style.overflowY = 'auto';

        // title
        const title = document.createElement('h2');
        title.textContent = 'Classement';
        title.style.color = '#fff';
        title.style.marginBottom = '20px';

        // add it to the leaderboard box
        leaderboardBox.appendChild(title);

        //create the score table
        if (times.length > 0) {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.color = '#fff';

            // header of tabs
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            const headers = ['Position', 'Pseudo', 'Temps Restant', 'Date'];
            headers.forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.padding = '10px';
                th.style.borderBottom = '1px solid #555';
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // body of the table
            const tbody = document.createElement('tbody');
            times.forEach((entry, index) => {
                const row = document.createElement('tr');

                // Position
                const positionCell = document.createElement('td');
                positionCell.textContent = (index + 1) + '.';
                positionCell.style.padding = '8px';

                // Pseudo
                const pseudoCell = document.createElement('td');
                pseudoCell.textContent = entry.pseudo;
                pseudoCell.style.padding = '8px';

                // Time
                const timeCell = document.createElement('td');
                timeCell.textContent = entry.time;
                timeCell.style.padding = '8px';

                // Date
                const dateCell = document.createElement('td');
                const date = new Date(entry.date);
                dateCell.textContent = date.toLocaleDateString();
                dateCell.style.padding = '8px';

                row.appendChild(positionCell);
                row.appendChild(pseudoCell);
                row.appendChild(timeCell);
                row.appendChild(dateCell);

                // put an effect on the first
                if (index === 0) {
                    row.style.backgroundColor = 'rgba(0, 102, 204, 0.3)';
                    row.style.fontWeight = 'bold';
                }

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            leaderboardBox.appendChild(table);
        } else {
            // message if no times are saved
            const message = document.createElement('p');
            message.textContent = 'Aucun résultat enregistré pour le moment.';
            message.style.color = '#ccc';
            leaderboardBox.appendChild(message);
        }

        // Bouton close
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fermer';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#0066CC';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginTop = '20px';

        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        //add all in the page
        leaderboardBox.appendChild(closeButton);
        overlay.appendChild(leaderboardBox);
        document.body.appendChild(overlay);
    }
});