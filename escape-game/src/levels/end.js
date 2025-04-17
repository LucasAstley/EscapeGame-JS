import leaderboard from '../leaderbord.js';
import {playSound} from "../utils/sound.js";
import {clearLocalStorage} from '../game.js';

document.addEventListener('DOMContentLoaded', () => {
    const winContent = document.getElementById('winContent');
    const loseContent = document.getElementById('loseContent');
    const hasWin = localStorage.getItem('has_win') === 'true';
    const finalTime = localStorage.getItem('final_time') || "00:00";
    const returnButton = document.querySelector('.btn');

    if (hasWin) {
        winContent.style.display = 'block';
        // Play the good ending sound (bypass the no interaction policy)
        window.onload = () => {
            playSound('../public/assets/sounds/good_ending.mp3');
        }
    } else {
        loseContent.style.display = 'block';
        // Play the bad ending sound (bypass the no interaction policy)
        window.onload = () => {
            playSound('../public/assets/sounds/bad_ending.wav');
        }
    }

    returnButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (hasWin) {
            leaderboard.showPseudoPrompt(finalTime, (pseudo) => {
                console.log(`Temps de ${pseudo}: ${finalTime} enregistré!`);
                clearLocalStorage();
                window.location.href = '../../index.html';
            });
        } else {
            clearLocalStorage();
            window.location.href = '../../index.html';
        }
    });
});