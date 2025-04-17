import {clearLocalStorage} from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    // create a timer element
    const timer = document.getElementById('timer');
    let countDownDate;

    // check if the timer is already set in local storage
    const localTimer = localStorage.getItem('timer');

    if (localTimer) {
        // if the timer is already set, use it
        countDownDate = parseInt(localTimer);
    }else {
        // if the timer is not set, set it to 5 minutes from now
        countDownDate = new Date().getTime() + 5 * 60 * 1000;

        // save the timer in local storage
        localStorage.setItem('timer', countDownDate.toString());
    }

    function updateTimer() {
        // Get the current time
        const now = new Date().getTime();
        // Calculate the time left
        const timeLeft = countDownDate - now;

        // Calculate minutes and seconds
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Update the timer element
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timer.textContent = "00:00";
            localStorage.setItem('has_win', 'false');
            window.location.href = 'end.html';
        }
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
});


