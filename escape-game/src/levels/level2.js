import {flameAnimation} from '../utils/animations.js';
import {playSound} from '../utils/sound.js';
import sharedStorage from "../inventory-manager.js";
import {
    resizeCanvas, calculateImageDimensions, updateClickableZones,
    isPointInRect, setupResizeHandler,
    canvas, ctx
} from '../ui.js';
import {Item, message, messageOnce} from "../game.js";

resizeCanvas();

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;

const image = new Image();
image.src = 'assets/images/corridor/corridor_background.png';
const flameImages = [
    'assets/images/corridor/corridor_flame_1.png',
    'assets/images/corridor/corridor_flame_2.png',
    'assets/images/corridor/corridor_flame_3.png',
    'assets/images/corridor/corridor_flame_4.png'
];

/*
 * Set the clickable zones for the doors in the corridor
 */
const clickableZonesOriginal = [
    {
        x1: 165, y1: 0,
        x2: 345, y2: 650,
        name: 'porte_1'
    },
    {
        x1: 455, y1: 30,
        x2: 500, y2: 480,
        name: 'porte_2'
    },
    {
        x1: 590, y1: 190,
        x2: 685, y2: 380,
        name: 'porte_3'
    },
    {
        x1: 788, y1: 40,
        x2: 820, y2: 490,
        name: 'porte_4'
    },
    {
        x1: 920, y1: 0,
        x2: 1050, y2: 650,
        name: 'porte_5'
    }
];

let dimensions;
let clickableZones = [];
let animationController;

const CORRECT_COMBINATION = [2, 6, 4];
const PADLOCK_STORAGE_KEY = 'basement_door_unlocked';

function updateSceneElements() {
    dimensions = calculateImageDimensions(IMAGE_WIDTH, IMAGE_HEIGHT);
    clickableZones = updateClickableZones(clickableZonesOriginal, dimensions, IMAGE_WIDTH, IMAGE_HEIGHT);
}

const itemTibbers = new Item("Tibbers", "../../public/assets/images/tibbers.png");
const gameWindow = document.querySelector('.game-window');

/*
 * Handle the click actions for each door
 */
const clickActions = {
    'porte_1': () => {
        if (localStorage.getItem('gameStatus') < '5') {
            gameWindow.appendChild(message("Je crois que j'ai laissé Tibbers dans la cave..."));
        } else {
            window.location.href = 'bedroom.html';
        }
    },
    'porte_2': () => window.location.href = 'kitchen.html',
    'porte_3': () => {
        if (sharedStorage.hasItem(itemTibbers)) {
            window.location.href = 'final_qte.html';
        } else {
            gameWindow.appendChild(message("Je dois d'abord trouver Tibbers avant de partir!"));
        }
    },
    'porte_4': () => window.location.href = 'living_room.html',
    'porte_5': () => {
        if (localStorage.getItem(PADLOCK_STORAGE_KEY) === 'true') {
            window.location.href = 'basement.html';
            localStorage.setItem('gameStatus', '5');
        } else {
            showPadlockPopup();
        }
    },
};

function showPadlockPopup() {
    // Show the padlock popup when the player clicks on the door
    const popup = document.getElementById('padlock-popup');
    popup.style.display = 'flex';

    const digitValues = document.querySelectorAll('.digit-value');
    digitValues.forEach(digitValue => {
        digitValue.textContent = '1';
    });

    setupPadlockEvents();
}

function handleUpButtonClick() {
    // Increment the digit value when the up button is clicked
    const digitValue = this.nextElementSibling;
    let value = parseInt(digitValue.textContent);
    value = value < 9 ? value + 1 : 1;
    digitValue.textContent = value;
}

function handleDownButtonClick() {
    // Decrement the digit value when the down button is clicked
    const digitValue = this.previousElementSibling;
    let value = parseInt(digitValue.textContent);
    value = value > 1 ? value - 1 : 9;
    digitValue.textContent = value;
}

function handleCloseButtonClick() {
    document.getElementById('padlock-popup').style.display = 'none';
}

function setupPadlockEvents() {
    // Set up event listeners for the padlock buttons
    document.querySelectorAll('.up-button').forEach(button => {
        button.removeEventListener('click', handleUpButtonClick);
    });

    document.querySelectorAll('.down-button').forEach(button => {
        button.removeEventListener('click', handleDownButtonClick);
    });

    const validateButton = document.getElementById('validate-button');
    validateButton.removeEventListener('click', validateCombination);

    const closeButton = document.getElementById('close-button');
    closeButton.removeEventListener('click', handleCloseButtonClick);

    document.querySelectorAll('.up-button').forEach(button => {
        button.addEventListener('click', handleUpButtonClick);
    });

    document.querySelectorAll('.down-button').forEach(button => {
        button.addEventListener('click', handleDownButtonClick);
    });

    validateButton.addEventListener('click', validateCombination);
    closeButton.addEventListener('click', handleCloseButtonClick);
}

function showSuccessEffect() {
    // Show a success effect when the correct combination is entered
    const padlockContainer = document.querySelector('.padlock-container');
    let blinkCount = 0;
    const maxBlinks = 3;
    const originalBackground = padlockContainer.style.background || getComputedStyle(padlockContainer).background;

    const blinkGreen = () => {
        if (blinkCount >= maxBlinks * 2) {
            padlockContainer.style.background = originalBackground;
            localStorage.setItem(PADLOCK_STORAGE_KEY, 'true');
            document.getElementById('padlock-popup').style.display = 'none';
            return;
        }

        if (blinkCount % 2 === 0) {
            padlockContainer.style.background = 'linear-gradient(145deg, #3ca435, #2a8025)';
        } else {
            padlockContainer.style.background = originalBackground;
        }

        blinkCount++;
        setTimeout(blinkGreen, 200);
    };

    blinkGreen();
}

function showFailEffect() {
    // Show a fail effect when the wrong combination is entered
    const padlockContainer = document.querySelector('.padlock-container');
    const originalBackground = padlockContainer.style.background || getComputedStyle(padlockContainer).background;

    padlockContainer.style.background = 'linear-gradient(145deg, #d33, #b22)';

    setTimeout(() => {
        padlockContainer.style.background = originalBackground;
    }, 1000);
}

function validateCombination() {
    // Validate the entered combination and play sounds
    const digitValues = document.querySelectorAll('.digit-value');
    const enteredCombination = Array.from(digitValues).map(digit => parseInt(digit.textContent));

    if (
        enteredCombination[0] === CORRECT_COMBINATION[0] && // Rouge = 2
        enteredCombination[1] === CORRECT_COMBINATION[1] && // Bleu = 6
        enteredCombination[2] === CORRECT_COMBINATION[2]    // Vert = 4
    ) {
        playSound('../public/assets/sounds/success.mp3');
        localStorage.setItem('gameStatus', '4');
        showSuccessEffect();
    } else {
        playSound('../public/assets/sounds/fail.mp3');
        showFailEffect();
    }
}

function handleResize() {
    // Resize the canvas and update clickable zones on window resize
    updateSceneElements();

    if (animationController) {
        animationController.stop();
        animationController = flameAnimation(ctx, image, flameImages);
    }
}

function handleMouseMove(event) {
    // Handle mouse movement to change the cursor style
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let isOverClickable = false;
    for (const zone of clickableZones) {
        if (isPointInRect(x, y, zone)) {
            isOverClickable = true;
            break;
        }
    }

    canvas.style.cursor = isOverClickable ? 'pointer' : 'default';
}

function handleClick(event) {
    // Handle click events on the clickable zones
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const zone of clickableZones) {
        if (isPointInRect(x, y, zone)) {
            const action = clickActions[zone.name];
            if (action) action();
        }
    }
}

updateSceneElements();

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleClick);
setupResizeHandler(handleResize);

image.onload = () => {
    updateSceneElements();
    animationController = flameAnimation(ctx, image, flameImages);
};

if (localStorage.getItem(PADLOCK_STORAGE_KEY) === null) {
    localStorage.setItem(PADLOCK_STORAGE_KEY, 'false');
}

document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('message_Corridor') !== 'true') {
        setTimeout(() => {
            gameWindow.appendChild(messageOnce("Maman, saura sûrement où est Tibbers. Elle se trouve dans la cave, allons la voir.", "Corridor"));
        }, 200);
    }


    sharedStorage.showInventory();
});

