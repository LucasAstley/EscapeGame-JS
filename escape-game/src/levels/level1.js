import sharedStorage from '../inventory-manager.js';
import {Item, message , messageOnce} from '../game.js';
import { resizeCanvas, canvas, ctx } from '../ui.js';

// init Items
const nuts = new Item("Noix", "assets/images/parc/nuts.png");
const key = new Item("Clé", "assets/images/parc/key.png");
const pawn = new Item("Pion", "assets/images/basement/pion.png");

resizeCanvas();
// Check if the game status is already set in localStorage
if (!localStorage.getItem('gameStatus')) {
    localStorage.setItem('gameStatus', '1');
}

const backgroundImage = new Image();
backgroundImage.src = 'assets/images/parc/parc.png';

function draw() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}
backgroundImage.onload = () => draw();


// this class handles the scratch layer permite to scratch the canvas
class ScratchLayer {
    // constructor
    constructor(scratchCanvas) {
        //init the canvas
        this.canvas = scratchCanvas;
        this.ctx = scratchCanvas.getContext('2d');

        // set the canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        // set the canvas style with the image
        const sandImage = new Image();
        sandImage.src = 'assets/images/parc/sable2.png';

        // draw the image on the canvas
        sandImage.onload = () => {
            this.ctx.drawImage(sandImage, 0, 0, this.canvas.width, this.canvas.height);
        };

        // init the variables to see if the user is drawing or not
        this.isDrawing = false;
        // Init the lisneteners for events
        this.setupEventListeners();
    }

    // this function setup the event listeners for the canvas
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.scratch(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    // this function start the drawing on the canvas
    startDrawing(e) {
        this.isDrawing = true;
        this.scratch(e);
    }

    // this function scratch the canvas is used in startDrawing and mousemove
    scratch(e) {
        if (!this.isDrawing) return;

        // get the position of the mouse on the canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        this.ctx.globalCompositeOperation = 'destination-out';
        // draw a transparent circle on the canvas
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // this function handle the click event on the canvas permits to click on the elements below the canvas
    handleClick(e) {
        // get the position of the click on the canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // verify if the click is on a transparent pixel
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const alpha = pixel[3];

        // if the alpha value is less than 50, it means that the pixel is transparent
        if (alpha < 50) {
            this.canvas.style.pointerEvents = 'none';
            const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            if (elemBelow) {
                elemBelow.click(); // simulate a click on the element below
            }
            this.canvas.style.pointerEvents = 'auto'; // re-enable pointer events
        }
    }

    // this function stop the drawing on the canvas
    stopDrawing() {
        this.isDrawing = false;
    }
}

function createPopup() {
    // create the popup element
    const popup = document.createElement('div');
    popup.className = 'popup';

    // set random positions for the fake nuts
    const positions = [
        {
            top: Math.floor(Math.random() * 70) + '%',
            left: Math.floor(Math.random() * 70) + '%'
        },
        {
            top: Math.floor(Math.random() * 70) + '%',
            left: Math.floor(Math.random() * 70) + '%'
        },
        {
            top: Math.floor(Math.random() * 70) + '%',
            left: Math.floor(Math.random() * 70) + '%'
        }
    ];

    // set the inner HTML of the popup
    popup.innerHTML = `
        <div class="popup-content">
            <div class="background-layer"></div>
            <div class="items-layer">
                <div class="Nuts"></div>
                <div class="fake-Nuts">
                    <div class="nut-position-1" style="position: absolute; width: 2vw; height: 2vw; top: ${positions[0].top}; left: ${positions[0].left}"></div>
                    <div class="nut-position-2" style="position: absolute; width: 2vw; height: 2vw; top: ${positions[1].top}; left: ${positions[1].left}"></div>
                    <div class="nut-position-3" style="position: absolute; width: 2vw; height: 2vw; top: ${positions[2].top}; left: ${positions[2].left}"></div>
                </div>
                <div class="pawn"></div>
            </div>
            <canvas class="scratch-layer"></canvas>
            <button class="close-popup"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg></button>
        </div>
    `;

    // wait for the image to load before drawing on the canvas
    requestAnimationFrame(() => {
        // select scratch layer
        const scratchCanvas = popup.querySelector('.scratch-layer');
        // instantiate the scratch layer
        new ScratchLayer(scratchCanvas);
    });

    // if click on the nuts add in the inventory
    popup.querySelector('.Nuts').addEventListener('click', () => {
        sharedStorage.addItem(nuts)
        sharedStorage.showInventory();
    })

    // same fot the pawn
    popup.querySelector('.pawn').addEventListener('click', () => {
        sharedStorage.addItem(pawn)
        sharedStorage.showInventory();
    })

    // if clicked on the close button remove the popup
    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });

    return popup;
}

window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
});

document.addEventListener('DOMContentLoaded', () => {
    draw();
    // showInventory for the first time
    sharedStorage.showInventory();

    //select the game window
    const gameWindow = document.querySelector('.game-window');

    // activate the message for the parc and past his value to true
    if (localStorage.getItem('message_Parc') !== true) {
        setTimeout(()=> {
            // show the message
            gameWindow.appendChild(messageOnce("Bonjour, monsieur, pouvez-vous m'aider à retrouver mon ours en peluche du nom de Tibbers ? mais je ne trouve plus les clés de ma maison!" , "Parc"));
        }, 200);
    }


    const sandClick = document.querySelector('.Sand-popup');
    const squirrelClick = document.querySelector('.squirrel');

    // get the game status from localStorage
    const getGameStatus = localStorage.getItem('gameStatus');

    // verify if the game status is more or equal than 2  or not
    if (!getGameStatus || parseInt(getGameStatus) >= 2) {
        // if the game status is more than 2 or 2, show the arrow for the next page
        gameWindow.appendChild(showArrow());
    }

    //  check if is a popup already opened
    let isClicked = false;

    sandClick.addEventListener('click', () => {
        if (!isClicked) {
            // create the popup
            gameWindow.appendChild(createPopup());
            isClicked = true;
        }

        // create the close button for the popup
        gameWindow.querySelector('.close-popup').addEventListener('click', () => {
            isClicked = false;
        });
    });

    // add the event listener for the squirrel
    squirrelClick.addEventListener('click', () => {
        if (!isClicked) {
            //if have a nuts
            if (sharedStorage.hasItem(nuts)) {
                // remove the nuts from the inventory
                sharedStorage.removeItem(nuts);
                // show the inventory for the gui on page
                sharedStorage.showInventory();

                // show the message of the squirrel
                gameWindow.appendChild(message("Merci pour la noix ! Voici un modeste présent en échange."));

                // add the key to the inventory
                sharedStorage.addItem(key);
                // show the inventory for the gui on page
                sharedStorage.showInventory();

                isClicked = true;
                //set the game status to 2 on the localStorage
                localStorage.setItem('gameStatus', '2');
                // show the arrow for the next page
                gameWindow.appendChild(showArrow())

            } else {
                // if the user click on the squirrel without nuts
                gameWindow.appendChild(message("Tu as une noix ? Je veux une noix !"));
                isClicked = true;
            }

            // create the close button for the popup
            gameWindow.querySelector('.close-message').addEventListener('click', () => {
                isClicked = false;
            });
        }
    });
});

function showArrow() {
    // create the arrow element
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.style.display = 'block' ;

    // event on click to go to the next page
    arrow.addEventListener('click', () => {
        setTimeout(() => {
            window.location.href = "interlude.html";
        }, 300);
    });
    return arrow;
}