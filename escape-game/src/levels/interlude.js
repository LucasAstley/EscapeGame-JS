import QteGame from './qte.js';
import {ctx} from '../ui.js';
import {Item} from '../game.js';
import sharedStorage from "../inventory-manager.js";


const key = new Item("Clé", "assets/images/parc/key.png");

class InterludeGame extends QteGame {
    static CONFIG = {
        IMAGE: {
            WIDTH: 1280,
            HEIGHT: 720,
            BACKGROUND_PATH: 'assets/images/interlude/background.png'
        },
        ZOOM: {
            BASE: 1.0,
            MAX: 1.6,
            MIN: 1.0,
            STEP: 0.04,
            DURATION: 500
        },
        OBSTACLE: {
            SIZE_RATIO: 5,
            BASE_INTERVAL: 1500,
            BASE_LIFETIME: 1200,
            MIN_INTERVAL: 1600,
            MIN_LIFETIME: 1000
        },
        GAME: {
            FAIL_THRESHOLD: 3,
            SLOW_DOWN_MULTIPLIER: 1.2,
            AUTO_START_DELAY: 1500,
            MAX_HELPS: 3,
            HELP_COOLDOWN: 5000
        },
        KEYS: {
            'A': 'assets/images/interlude/obstacleA.png',
            'D': 'assets/images/interlude/obstacleD.png',
            'E': 'assets/images/interlude/obstacleE.png',
            'Q': 'assets/images/interlude/obstacleQ.png',
            'S': 'assets/images/interlude/obstacleS.png',
            'Z': 'assets/images/interlude/obstacleZ.png'
        }
    };

    constructor() {
        super(InterludeGame.CONFIG);
        this.failedAttempts = 0;
        this.helpCount = 0;
        this.lastHelpTime = 0;
        this.obstacleInterval = InterludeGame.CONFIG.OBSTACLE.BASE_INTERVAL;
        this.obstacleLifetime = InterludeGame.CONFIG.OBSTACLE.BASE_LIFETIME;
    }

    onGameStart() {
        this.failedAttempts = 0;
        this.helpCount = 0;
        this.lastHelpTime = 0;
        this.obstacleInterval = InterludeGame.CONFIG.OBSTACLE.BASE_INTERVAL;
        this.obstacleLifetime = InterludeGame.CONFIG.OBSTACLE.BASE_LIFETIME;
    }

    onObstacleExpired() {
        this.handleFailure();
    }

    onWrongKeyPressed() {
        this.handleFailure();
    }

    handleFailure() {
        this.failedAttempts++;

        if (this.failedAttempts >= InterludeGame.CONFIG.GAME.FAIL_THRESHOLD) {
            const now = Date.now();
            const canHelp =
                this.helpCount < InterludeGame.CONFIG.GAME.MAX_HELPS &&
                now - this.lastHelpTime > InterludeGame.CONFIG.GAME.HELP_COOLDOWN;

            if (canHelp) {
                this.slowDownGame();
                this.helpCount++;
                this.lastHelpTime = now;
                console.log(`Aide ${this.helpCount}/${InterludeGame.CONFIG.GAME.MAX_HELPS} utilisée`);
            } else if (this.helpCount >= InterludeGame.CONFIG.GAME.MAX_HELPS) {
                console.log(`Maximum d'aides atteint (${InterludeGame.CONFIG.GAME.MAX_HELPS})`);
            } else {
                console.log(`Aide en cooldown, temps restant: ${(InterludeGame.CONFIG.GAME.HELP_COOLDOWN - (now - this.lastHelpTime)) / 1000}s`);
            }

            this.failedAttempts = 0;
        }
    }

    slowDownGame() {
        this.obstacleInterval *= InterludeGame.CONFIG.GAME.SLOW_DOWN_MULTIPLIER;
        this.obstacleLifetime *= InterludeGame.CONFIG.GAME.SLOW_DOWN_MULTIPLIER;

        console.log(`Jeu ralenti: intervalle=${this.obstacleInterval}ms, durée=${this.obstacleLifetime}ms`);

        if (this.obstacleTimerId) {
            clearInterval(this.obstacleTimerId);
            this.obstacleTimerId = setInterval(
                () => this.spawnObstacle(),
                this.obstacleInterval
            );
        }
    }

    getObstacleInterval() {
        return this.obstacleInterval;
    }

    getObstacleLifetime() {
        return this.obstacleLifetime;
    }

    winGame() {
        this.gameStarted = false;
        clearInterval(this.obstacleTimerId);
        this.activeObstacles = [];

        sharedStorage.removeItem(key);
        sharedStorage.showInventory();

        localStorage.setItem('gameStatus', '3');

        setTimeout(() => {
            window.location.href = 'corridor.html';
        }, 500);
    }

    renderUI() {
        const progressBarWidth = this.dimensions.width;
        const progressBarHeight = 10;
        const progressBarX = 0;
        const progressBarY = this.dimensions.height - progressBarHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        const zoomProgress = (this.currentZoom - this.config.ZOOM.BASE) /
            (this.config.ZOOM.MAX - this.config.ZOOM.BASE);
        const filledWidth = progressBarWidth * Math.max(0, Math.min(1, zoomProgress));

        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(progressBarX, progressBarY, filledWidth, progressBarHeight);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    sharedStorage.showInventory()
});

// Initialisation du jeu
const game = new InterludeGame();
game.init();

export default game;

