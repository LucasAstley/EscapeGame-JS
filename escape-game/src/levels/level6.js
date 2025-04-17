import {
    resizeCanvas,
    canvas,
    ctx,
    isPointInRect
} from '../ui.js';
import sharedStorage from "../inventory-manager.js";
import {Item, message, messageOnce} from "../game.js";

resizeCanvas();

const image = new Image();
image.src = 'assets/images/basement/basement_background.png';

const chessboardImage = new Image();
chessboardImage.src = 'assets/images/basement/echiquier_sol.png';

const pawn = new Item("Pion", "assets/images/basement/pion.png");

const chessboardPos = {
    x: 0.65,
    y: 0.82,
    width: 0.15,
    height: 0.15
};

/*
    * Set the clickable zones in the basement
 */
let clickableZone = {x: 0, y: 0, width: 0, height: 0, name: 'chessboard'};

const correctZone = {x: 0.75, y: 0.124, width: 0.122, height: 0.12};

let showChessPopup = false;
let puzzleSolved = false;
let hasAttempted = localStorage.getItem('level6_chess_attempted') === 'true';

function draw() {
    // Draw the background image and the chessboard
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (!puzzleSolved && !hasAttempted && sharedStorage.hasItem(pawn)) {
        const baseWidth = canvas.width;
        const baseHeight = canvas.height;

        const chessX = baseWidth * chessboardPos.x;
        const chessY = baseHeight * chessboardPos.y;
        const chessWidth = baseWidth * chessboardPos.width;
        const chessHeight = baseHeight * chessboardPos.height;

        ctx.drawImage(chessboardImage, chessX, chessY, chessWidth, chessHeight);

        clickableZone = {
            x: chessX,
            y: chessY,
            width: chessWidth,
            height: chessHeight,
            name: 'chessboard'
        };
    }
}

function createChessPopup() {
    // Create the popup for the chess game
    const popupDiv = document.createElement('div');
    popupDiv.id = 'chess-popup';
    popupDiv.style.position = 'fixed';
    popupDiv.style.top = '0';
    popupDiv.style.left = '-8%';
    popupDiv.style.width = '100%';
    popupDiv.style.height = '100%';
    popupDiv.style.display = 'flex';
    popupDiv.style.justifyContent = 'center';
    popupDiv.style.alignItems = 'center';
    popupDiv.style.zIndex = '10';

    const chessContainer = document.createElement('div');
    chessContainer.className = 'chess-container';
    chessContainer.style.position = 'relative';
    chessContainer.style.background = 'linear-gradient(145deg, #8B4513, #654321)';
    chessContainer.style.padding = '20px';
    chessContainer.style.borderRadius = '10px';
    chessContainer.style.textAlign = 'center';
    chessContainer.style.maxWidth = '30%';
    chessContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.8)';

    const title = document.createElement('h2');
    title.textContent = "C'est votre tour, placez le pion";
    title.style.color = '#FFD700';
    title.style.marginBottom = '15px';
    title.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';
    chessContainer.appendChild(title);

    const chessImgContainer = document.createElement('div');
    chessImgContainer.style.position = 'relative';
    chessImgContainer.style.maxWidth = '100%';

    const chessImg = document.createElement('img');
    chessImg.src = 'assets/images/basement/echiquier.png';
    chessImg.style.maxWidth = '100%';
    chessImg.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    chessImg.style.cursor = 'none';

    const pionDiv = document.createElement('div');
    pionDiv.style.position = 'absolute';
    pionDiv.style.pointerEvents = 'none';
    pionDiv.style.zIndex = '100';
    pionDiv.style.transform = 'translate(-50%, -50%)';
    pionDiv.style.display = 'none';

    const pionImg = document.createElement('img');
    pionImg.src = 'assets/images/basement/pion.png';
    pionImg.style.width = '4em';
    pionImg.style.height = 'auto';
    pionImg.onload = () => {
        pionDiv.style.display = 'block';
    };

    pionDiv.appendChild(pionImg);
    chessImgContainer.appendChild(pionDiv);

    chessImgContainer.appendChild(chessImg);
    chessContainer.appendChild(chessImgContainer);

    const hasAttempted = localStorage.getItem('level6_chess_attempted') === 'true';

    chessImg.addEventListener('mousemove', function (e) {
        const rect = chessImg.getBoundingClientRect();
        pionDiv.style.left = (e.clientX - rect.left) + 'px';
        pionDiv.style.top = (e.clientY - rect.top) + 'px';
    });

    chessImg.addEventListener('click', function (e) {
        if (hasAttempted) return;

        localStorage.setItem('level6_chess_attempted', 'true');

        const rect = chessImg.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        if (x >= correctZone.x &&
            x <= correctZone.x + correctZone.width &&
            y >= correctZone.y &&
            y <= correctZone.y + correctZone.height) {

            const gameWindow = document.querySelector('.game-window');

            title.textContent = "Échec et mat !";
            title.style.color = '#3ca435';
            localStorage.setItem('level6_chess_result', 'true');
            sharedStorage.removeItem(pawn);
            sharedStorage.showInventory()
            gameWindow.appendChild(message("Vous avez eu un bonus pour la suite, il vous sera utile !"))
            localStorage.setItem('life_qte' , '4' )

        } else {
            title.textContent = "Perdu, ce n'est pas la bonne position...";
            title.style.color = '#d33';
            localStorage.setItem('level6_chess_result', 'false');
            sharedStorage.removeItem(pawn);
            sharedStorage.showInventory()
            localStorage.setItem('life_qte' , '3')
        }

        setTimeout(() => {
            document.body.removeChild(popupDiv);
            puzzleSolved = true;
            showChessPopup = false;
            draw();
        }, 2000);
    });

    popupDiv.appendChild(chessContainer);
    document.body.appendChild(popupDiv);
}

function handleMouseMove(event) {
    // Handle the cursor change on mouse move
    if (puzzleSolved || hasAttempted) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPointInRect(x, y, clickableZone)) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }
}

function handleClick(event) {
    // Handle click events on the clickable zones
    if (puzzleSolved || hasAttempted) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPointInRect(x, y, clickableZone)) {
        showChessPopup = true;
        createChessPopup();
    }
}

function handleResize() {
    // Resize the canvas and update clickable zones on window resize
    resizeCanvas();
    if (image.complete) draw();
}

window.addEventListener('resize', handleResize);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousemove', handleMouseMove);

let imagesLoaded = 0;
const requiredImages = 2;

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === requiredImages) {
        draw();
    }
}

image.onload = checkAllImagesLoaded;
chessboardImage.onload = checkAllImagesLoaded;

document.addEventListener('DOMContentLoaded', () => {
    const gameWindow = document.querySelector('.game-window');

    if (localStorage.getItem('message_Basement') !== 'true') {
        setTimeout(() => {
            gameWindow.appendChild(messageOnce("OH non! Maman se sent vraiment fatiguée, laissons-la se reposer, allons dans ma chambre.Elle a dû le ranger là-bas", "Basement"));
        }, 200);
    }


    const arrow = document.querySelector('.arrow');
    if (!arrow) {
        console.error("Élément flèche introuvable");
        return;
    }
    arrow.addEventListener('click', () => {
        window.location.href = 'corridor.html';
    });
})
