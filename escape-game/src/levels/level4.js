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
image.src = 'assets/images/kitchen/kitchen_background.png';
const flameImages = [
    'assets/images/kitchen/kitchen_flame_1.png',
    'assets/images/kitchen/kitchen_flame_2.png',
    'assets/images/kitchen/kitchen_flame_3.png'
];

/*
    * Set the clickable zones in the kitchen
 */
const clickableZonesOriginal = [
    {
        x1: 265, y1: 205,
        x2: 305, y2: 255,
        name: 'post_it_frigo'
    },
    {
        x1: 565, y1: 130,
        x2: 675, y2: 220,
        name: 'porte_placard'
    },
];

let dimensions;
let clickableZones = [];
let animationController;

const postItPopup = document.getElementById('post-it-popup');
const drawerPopup = document.getElementById('drawer-popup');

function initPopups() {
    // Initialize the clickable popups
    postItPopup.addEventListener('click', () => {
        postItPopup.style.display = 'none';
    });

    drawerPopup.addEventListener('click', () => {
        drawerPopup.style.display = 'none';
    });
}

function showPostItPopup() {
    postItPopup.style.display = 'block';
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
        if (isPointInRect(x, y, zone)) {
            switch (zone.name) {
                case 'post_it_frigo':
                    showPostItPopup();
                    break;
                case 'porte_placard':
                    showDrawerPopup();
                    break;
            }
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
    if (arrow) {
        arrow.addEventListener('click', () => {
            window.location.href = 'corridor.html';
        });
    }
});

