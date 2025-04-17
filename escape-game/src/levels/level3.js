import {flameAnimation} from '../utils/animations.js';
import {
    resizeCanvas, calculateImageDimensions,
    setupResizeHandler, canvas, ctx
} from '../ui.js';
import sharedStorage from "../inventory-manager.js";
import {Item, messageOnce} from "../game.js";

resizeCanvas();

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;


const screamerImage = new Image();
screamerImage.src = 'assets/images/annie.png';

const screamerSound = new Audio();
screamerSound.src = 'assets/sounds/annieSound.ogg';

const image = new Image();
image.src = 'assets/images/bedroom/bedroom_background.png';

const tibbers = new Image();
tibbers.src = 'assets/images/tibbers.png';

const itemTibbers = new Item("Tibbers", "assets/images/tibbers.png");

const plank = new Image();
plank.src = 'assets/images/bedroom/bedroom_plank.png';

const flameImages = [
    'assets/images/bedroom/bedroom_flame_1.png',
    'assets/images/bedroom/bedroom_flame_2.png',
    'assets/images/bedroom/bedroom_flame_3.png',
    'assets/images/bedroom/bedroom_flame_4.png',
    'assets/images/bedroom/bedroom_flame_5.png',
    'assets/images/bedroom/bedroom_flame_6.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

const TIBBERS_X_PERCENT = 0.45;
const TIBBERS_Y_PERCENT = 0.8;
const TIBBERS_SIZE_PERCENT = 0.1;

let renderedTibbersX, renderedTibbersY, renderedTibbersWidth, renderedTibbersHeight;
let dimensions;
let isDragging = false;
let draggedPlankIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;

/*
 * Set the position of the planks on the canvas
 */
const planks = [
    {
        x_percent: 0.45,
        y_percent: 0.72,
        rotation: -10,
        sizePercent: 0.20,
        x: 0, y: 0
    },
    {
        x_percent: 0.46,
        y_percent: 0.88,
        rotation: 195,
        sizePercent: 0.20,
        x: 0, y: 0
    },
    {
        x_percent: 0.46,
        y_percent: 0.77,
        rotation: -37,
        sizePercent: 0.20,
        x: 0, y: 0
    },
    {
        x_percent: 0.46,
        y_percent: 0.82,
        rotation: -20,
        sizePercent: 0.23,
        x: 0, y: 0
    }
];

function updateSceneElements() {
    // Calculate the dimensions of the image and the position of Tibbers
    dimensions = calculateImageDimensions(IMAGE_WIDTH, IMAGE_HEIGHT);
    const {renderedImageWidth, renderedImageHeight, imageX, imageY} = dimensions;

    renderedTibbersWidth = renderedImageWidth * TIBBERS_SIZE_PERCENT;
    renderedTibbersHeight = renderedTibbersWidth * (tibbers.naturalHeight || 1) / (tibbers.naturalWidth || 1);
    renderedTibbersX = imageX + renderedImageWidth * TIBBERS_X_PERCENT - renderedTibbersWidth / 2;
    renderedTibbersY = imageY + renderedImageHeight * TIBBERS_Y_PERCENT - renderedTibbersHeight / 2;

    planks.forEach(plankObj => {
        const plankWidth = renderedImageWidth * plankObj.sizePercent;
        const plankHeight = plankWidth * (plank.naturalHeight || 1) / (plank.naturalWidth || 1);

        plankObj.x = imageX + renderedImageWidth * plankObj.x_percent - plankWidth / 2;
        plankObj.y = imageY + renderedImageHeight * plankObj.y_percent - plankHeight / 2;
    });
}

function isPointCoveredByPlank(x, y) {
    // Check if the pointer is on a plank
    for (let i = 0; i < planks.length; i++) {
        const plankObj = planks[i];
        const {renderedImageWidth} = dimensions;
        const plankWidth = renderedImageWidth * plankObj.sizePercent;
        const plankHeight = plankWidth * (plank.naturalHeight || 1) / (plank.naturalWidth || 1);
        const plankX = plankObj.x;
        const plankY = plankObj.y;

        const centerX = plankX + plankWidth / 2;
        const centerY = plankY + plankHeight / 2;

        const angle = -plankObj.rotation * Math.PI / 180;
        const rotatedX = Math.cos(angle) * (x - centerX) - Math.sin(angle) * (y - centerY) + centerX;
        const rotatedY = Math.sin(angle) * (x - centerX) + Math.cos(angle) * (y - centerY) + centerY;

        if (rotatedX >= plankX && rotatedX <= plankX + plankWidth &&
            rotatedY >= plankY && rotatedY <= plankY + plankHeight) {
            return true;
        }
    }
    return false;
}

function getClickedPlankIndex(x, y) {
    // Get the index of the clicked plank (handle dragging)
    for (let i = planks.length - 1; i >= 0; i--) {
        const plankObj = planks[i];
        const {renderedImageWidth} = dimensions;
        const plankWidth = renderedImageWidth * plankObj.sizePercent;
        const plankHeight = plankWidth * (plank.naturalHeight || 1) / (plank.naturalWidth || 1);
        const plankX = plankObj.x;
        const plankY = plankObj.y;

        const centerX = plankX + plankWidth / 2;
        const centerY = plankY + plankHeight / 2;

        const angle = -plankObj.rotation * Math.PI / 180;
        const rotatedX = Math.cos(angle) * (x - centerX) - Math.sin(angle) * (y - centerY) + centerX;
        const rotatedY = Math.sin(angle) * (x - centerX) + Math.cos(angle) * (y - centerY) + centerY;

        if (rotatedX >= plankX && rotatedX <= plankX + plankWidth &&
            rotatedY >= plankY && rotatedY <= plankY + plankHeight) {
            return i;
        }
    }
    return -1;
}

function isPointInTibbers(x, y) {
    // Check is the pointer is on Tibbers
    return x >= renderedTibbersX && x <= renderedTibbersX + renderedTibbersWidth &&
        y >= renderedTibbersY && y <= renderedTibbersY + renderedTibbersHeight;
}

function handleMouseDown(event) {
    // Handle mouse down event to start dragging
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const plankIndex = getClickedPlankIndex(x, y);

    if (plankIndex !== -1) {
        const clickedPlank = planks.splice(plankIndex, 1)[0];
        planks.push(clickedPlank);

        isDragging = true;
        draggedPlankIndex = planks.length - 1;

        const plankObj = planks[draggedPlankIndex];
        dragOffsetX = x - plankObj.x;
        dragOffsetY = y - plankObj.y;

    } else if (isPointInTibbers(x, y) && !isPointCoveredByPlank(x, y)) {
        screamerSound.play();

        showScreamer();

        setTimeout(() => {
            sharedStorage.addItem(itemTibbers);
            sharedStorage.savedToLocalStorage();
            sharedStorage.showInventory();
            localStorage.setItem('gameStatus', '6');
            window.location.href = "final_qte.html";
        }, 2000);

    }
}

function handleMouseMove(event) {
    // Handle mouse move event to update the position of the planks
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDragging) {
        const {renderedImageWidth, renderedImageHeight, imageX, imageY} = dimensions;
        planks[draggedPlankIndex].x = x - dragOffsetX;
        planks[draggedPlankIndex].y = y - dragOffsetY;

        planks[draggedPlankIndex].x_percent = (planks[draggedPlankIndex].x + renderedImageWidth * planks[draggedPlankIndex].sizePercent / 2 - imageX) / renderedImageWidth;
        planks[draggedPlankIndex].y_percent = (planks[draggedPlankIndex].y + renderedImageHeight * planks[draggedPlankIndex].sizePercent * (plank.naturalHeight || 1) / (plank.naturalWidth || 1) / 2 - imageY) / renderedImageHeight;
    } else {
        const plankIndex = getClickedPlankIndex(x, y);
        if (plankIndex !== -1) {
            canvas.style.cursor = "move";
        } else if (isPointInTibbers(x, y) && !isPointCoveredByPlank(x, y)) {
            canvas.style.cursor = "pointer";
        } else {
            canvas.style.cursor = "default";
        }
    }
}

function handleMouseUp() {
    isDragging = false;
    draggedPlankIndex = -1;
}

let animationController;
let overlayAnimationId;

function drawOverlayElements() {
    // Draw Tibbers and planks on the canvas
    if (tibbers.complete && tibbers.naturalWidth > 0) {
        ctx.drawImage(tibbers, renderedTibbersX, renderedTibbersY, renderedTibbersWidth, renderedTibbersHeight);
    }

    if (plank.complete && plank.naturalWidth > 0) {
        planks.forEach(plankObj => {
            ctx.save();
            const {renderedImageWidth} = dimensions;
            const plankWidth = renderedImageWidth * plankObj.sizePercent;
            const plankHeight = plankWidth * (plank.naturalHeight || 1) / (plank.naturalWidth || 1);

            ctx.translate(plankObj.x + plankWidth / 2, plankObj.y + plankHeight / 2);
            ctx.rotate(plankObj.rotation * Math.PI / 180);
            ctx.translate(-(plankObj.x + plankWidth / 2), -(plankObj.y + plankHeight / 2));

            ctx.drawImage(plank, plankObj.x, plankObj.y, plankWidth, plankHeight);

            ctx.restore();
        });
    }

    overlayAnimationId = requestAnimationFrame(drawOverlayElements);
}

function handleResize() {
    // Resize the canvas and update clickable zones on window resize
    updateSceneElements();

    if (animationController) {
        animationController.stop();
        startAnimation();
    }
}

function startAnimation() {
    // Init animation controller and start the animation
    updateSceneElements();

    if (overlayAnimationId) {
        cancelAnimationFrame(overlayAnimationId);
    }

    if (image.complete && image.naturalWidth > 0) {
        animationController = flameAnimation(ctx, image, flameImages);
        drawOverlayElements();
    }
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);
setupResizeHandler(handleResize);

Promise.all([
    new Promise(resolve => {
        if (image.complete) resolve();
        else image.onload = resolve;
    }),
    new Promise(resolve => {
        if (tibbers.complete) resolve();
        else tibbers.onload = resolve;
    }),
    new Promise(resolve => {
        if (plank.complete) resolve();
        else plank.onload = resolve;
    })
]).then(startAnimation);


document.addEventListener('DOMContentLoaded', () => {
    sharedStorage.showInventory();

    const gameWindow = document.querySelector('.game-window');


    if (localStorage.getItem('message_Bedroom') !== 'true') {
        setTimeout(() => {
            gameWindow.appendChild(messageOnce("Mais, ce n'est pas possible, je ne le vois nulle part cherchons il ne doit pas être très loin", "Bedroom"));
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
});

function showScreamer() {
    // stop the animation
    if (overlayAnimationId) {
        cancelAnimationFrame(overlayAnimationId);
        overlayAnimationId = null;
    }
    if (animationController) {
        animationController.stop();
    }

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background (screamer)
    ctx.drawImage(screamerImage, 0, 0, canvas.width, canvas.height);
}