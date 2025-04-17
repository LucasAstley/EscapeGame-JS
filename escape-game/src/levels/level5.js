import {flameAnimation} from '../utils/animations.js';
import {
    resizeCanvas, calculateImageDimensions, updateClickableZones,
    isPointInRect, setupResizeHandler, canvas, ctx
} from '../ui.js';
import sharedStorage from "../inventory-manager.js";

resizeCanvas();

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;

const image = new Image();
image.src = 'assets/images/living_room/living_room_background.png';
const flameImages = [
    'assets/images/living_room/living_room_flame_1.png',
    'assets/images/living_room/living_room_flame_2.png'
];

/*
 * Set the clickable zones in the living room
 */
const clickableZonesOriginal = [
    {
        x1: 200, y1: 535,
        x2: 350, y2: 600,
        name: 'tirroir'
    }
];

let dimensions;
let clickableZones = [];
let animationController;

const drawerPopup = document.getElementById('drawer-popup');

function initPopups() {
    drawerPopup.addEventListener('click', () => {
        drawerPopup.style.display = 'none';
    });
}

function showDrawerPopup() {
    drawerPopup.style.display = 'block';
}

function updateSceneElements() {
    dimensions = calculateImageDimensions(IMAGE_WIDTH, IMAGE_HEIGHT);
    clickableZones = updateClickableZones(clickableZonesOriginal, dimensions, IMAGE_WIDTH, IMAGE_HEIGHT);
}

function handleMouseMove(event) {
    // Handle the cursor change on mouse move
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
        if (isPointInRect(x, y, zone) && zone.name === 'tirroir') {
            showDrawerPopup();
            break;
        }
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

canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousemove', handleMouseMove);
setupResizeHandler(handleResize);

image.onload = () => {
    updateSceneElements();
    animationController = flameAnimation(ctx, image, flameImages);
};

document.addEventListener('DOMContentLoaded', () => {
    initPopups();
    sharedStorage.showInventory();

    const arrow = document.querySelector('.arrow');
    if (!arrow) {
        console.error("Élément flèche introuvable");
        return;
    }
    arrow.addEventListener('click', () => {
        window.location.href = 'corridor.html';
    });
});
