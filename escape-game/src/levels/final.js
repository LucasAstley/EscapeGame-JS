import QteGame from './qte.js';
import {canvas, ctx} from '../ui.js';
import {clearLocalStorage} from "../game.js";
import leaderboard from "../leaderbord.js";

class FinalQteGame extends QteGame {
    static CONFIG = {
        IMAGE: {
            WIDTH: 1280,
            HEIGHT: 720,
            BACKGROUND_PATH: 'assets/images/corridor/corridor_background.png',
            GAME_OVER_PATH: 'assets/images/final_qte/game_over.png',
            HEART_FULL_PATH: 'assets/images/final_qte/heart_full.png',
            HEART_EMPTY_PATH: 'assets/images/final_qte/heart_empty.png'
        },
        ZOOM: {
            BASE: 1.1,
            MAX: 1.7,
            MIN: 1.0,
            STEP: 0.05,
            DURATION: 500
        },
        OBSTACLE: {
            SIZE_RATIO: 5,
            INITIAL_INTERVAL: 1200,
            INITIAL_LIFETIME: 850,
            MIN_INTERVAL: 1000,
            MIN_LIFETIME: 650
        },
        GAME: {
            PENALTY_COOLDOWN: 1000,
            GAME_OVER_ANIMATION_DURATION: 2000,
            AUTO_START_DELAY: 1500
        },
        KEYS: {
            'A': 'assets/images/final_qte/obstacleA.png',
            'D': 'assets/images/final_qte/obstacleD.png',
            'E': 'assets/images/final_qte/obstacleE.png',
            'Q': 'assets/images/final_qte/obstacleQ.png',
            'S': 'assets/images/final_qte/obstacleS.png',
            'Z': 'assets/images/final_qte/obstacleZ.png'
        }
    };

    constructor() {
        super(FinalQteGame.CONFIG);
        if (!localStorage.getItem('life_qte')) {
            localStorage.setItem('life_qte', '3');
        }
        // Propriétés spécifiques
        this.maxLives = localStorage.getItem('life_qte');
        this.lives = this.maxLives;
        this.hasSucceededOnce = false;
        this.lastPenaltyTime = 0;
        this.redFilterOpacity = 0;
        this.gameOverAnimation = false;
        this.animationStartTime = 0;
        this.currentObstacleInterval = FinalQteGame.CONFIG.OBSTACLE.INITIAL_INTERVAL;
        this.currentObstacleLifetime = FinalQteGame.CONFIG.OBSTACLE.INITIAL_LIFETIME;

        // Charger l'image de game over
        this.gameOverImage = new Image();
        this.gameOverImage.src = FinalQteGame.CONFIG.IMAGE.GAME_OVER_PATH;
        this.heartFullImage = new Image();
        this.heartFullImage.src = FinalQteGame.CONFIG.IMAGE.HEART_FULL_PATH;
        this.heartEmptyImage = new Image();
        this.heartEmptyImage.src = FinalQteGame.CONFIG.IMAGE.HEART_EMPTY_PATH;

    }

    onGameStart() {
        this.lives = this.maxLives;
        this.redFilterOpacity = 0;
        this.gameOverAnimation = false;
        this.hasSucceededOnce = false;
        this.currentObstacleInterval = FinalQteGame.CONFIG.OBSTACLE.INITIAL_INTERVAL;
        this.currentObstacleLifetime = FinalQteGame.CONFIG.OBSTACLE.INITIAL_LIFETIME;
    }

    onZoomIncreased() {
        this.hasSucceededOnce = true;

        // Augmentation progressive de la difficulté
        const progressRatio = (this.zoomTarget - this.config.ZOOM.BASE) /
            (this.config.ZOOM.MAX - this.config.ZOOM.BASE);

        this.currentObstacleInterval = FinalQteGame.CONFIG.OBSTACLE.INITIAL_INTERVAL -
            progressRatio * (FinalQteGame.CONFIG.OBSTACLE.INITIAL_INTERVAL -
                FinalQteGame.CONFIG.OBSTACLE.MIN_INTERVAL);

        this.currentObstacleLifetime = FinalQteGame.CONFIG.OBSTACLE.INITIAL_LIFETIME -
            progressRatio * (FinalQteGame.CONFIG.OBSTACLE.INITIAL_LIFETIME -
                FinalQteGame.CONFIG.OBSTACLE.MIN_LIFETIME);

        if (this.obstacleTimerId) {
            clearInterval(this.obstacleTimerId);
            this.obstacleTimerId = setInterval(
                () => this.spawnObstacle(),
                this.currentObstacleInterval
            );
        }
    }

    onObstacleExpired() {
        this.decreaseZoom();
    }

    onWrongKeyPressed() {
        this.decreaseZoom();
    }

    getObstacleInterval() {
        return this.currentObstacleInterval;
    }

    getObstacleLifetime() {
        return this.currentObstacleLifetime;
    }

    decreaseZoom() {
        const now = Date.now();
        if (now - this.lastPenaltyTime < FinalQteGame.CONFIG.GAME.PENALTY_COOLDOWN) {
            console.log("Cooldown de pénalité, pas de dézoom supplémentaire");
            return;
        }

        this.lastPenaltyTime = now;

        if (this.zoomTarget <= this.config.ZOOM.MIN) {
            // Ne perdre une vie que si le joueur a déjà réussi une fois
            if (this.hasSucceededOnce) {
                this.loseLife();
            } else {
                console.log("Protection de départ: pas de perte de vie");
                this.redFilterOpacity = 0.05;
                setTimeout(() => {
                    if (!this.gameOverAnimation) this.redFilterOpacity = 0;
                }, 300);
            }
        } else {
            this.zoomTarget = Math.max(
                this.config.ZOOM.MIN,
                this.zoomTarget - this.config.ZOOM.STEP
            );
            this.lastZoomTime = Date.now();
        }
    }

    winGame() {
        this.gameStarted = false;
        clearInterval(this.obstacleTimerId);
        this.activeObstacles = [];

        const timerElement = document.getElementById('timer');
        let tempsFinal = "00:00";

        if (timerElement) {
            tempsFinal = timerElement.textContent;
        }

        // Stocker le temps final et marquer comme gagné
        localStorage.setItem('has_win', 'true');
        localStorage.setItem('final_time', tempsFinal);

        // Rediriger vers la page de fin au lieu d'afficher le prompt ici
        window.location.href = 'end.html';
    }

    loseGame() {
        this.gameStarted = false;
        clearInterval(this.obstacleTimerId);

        this.gameOverAnimation = true;
        this.animationStartTime = Date.now();

        this.cleanupEventListeners();

        // Marquer comme perdu
        localStorage.setItem('has_win', 'false');

        // Afficher l'animation de game over puis rediriger après 2 secondes
        setTimeout(() => {
            window.location.href = 'end.html';
        }, 2000);
    }


    loseLife() {
        this.lives--;
        console.log(`Vie perdue! Vies restantes: ${this.lives}`);

        if (this.lives === 2) {
            this.redFilterOpacity = 0.1;
        } else if (this.lives === 1) {
            this.redFilterOpacity = 0.2;
        } else if (this.lives <= 0) {
            this.loseGame();
        }
    }

    renderUI() {
        const heartWidth = 100;
        const heartHeight = 64;
        const heartSpacing = 10;
        const startX = 20;
        const startY = 20;

        for (let i = 0; i < this.maxLives; i++) {
            const heartImage = i < this.lives ? this.heartFullImage : this.heartEmptyImage;
            ctx.drawImage(
                heartImage,
                startX + i * (heartWidth + heartSpacing),
                startY,
                heartWidth,
                heartHeight
            );
        }

        const progressBarWidth = this.dimensions.width;
        const progressBarHeight = 10;
        const progressBarX = 0;
        const progressBarY = this.dimensions.height - progressBarHeight;

        // Remplissage selon le zoom
        const zoomProgress = (this.currentZoom - this.config.ZOOM.BASE) /
            (this.config.ZOOM.MAX - this.config.ZOOM.BASE);
        const filledWidth = progressBarWidth * Math.max(0, Math.min(1, zoomProgress));

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        ctx.fillStyle = '#8B0000';
        ctx.fillRect(progressBarX, progressBarY, filledWidth, progressBarHeight);
    }

    renderEffects() {
        if (this.redFilterOpacity <= 0) return;

        if (this.gameOverAnimation) {
            const elapsed = Date.now() - this.animationStartTime;
            const progress = Math.min(1, elapsed / FinalQteGame.CONFIG.GAME.GAME_OVER_ANIMATION_DURATION);

            // Augmenter progressivement l'opacité jusqu'à 1 (100%)
            this.redFilterOpacity = 0.2 + 0.8 * progress;

            // Dessiner le filtre rouge
            ctx.fillStyle = `rgba(255, 0, 0, ${this.redFilterOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Si l'image est chargée, afficher l'image Game Over avec opacité progressive
            if (this.gameOverImage.complete && this.dimensions) {
                ctx.globalAlpha = progress;
                ctx.drawImage(
                    this.gameOverImage,
                    0, 0,
                    this.dimensions.width,
                    this.dimensions.height
                );
                ctx.globalAlpha = 1;
            }
        } else {
            // Dessiner le filtre rouge normal (pour les pertes de vie)
            ctx.fillStyle = `rgba(255, 0, 0, ${this.redFilterOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

// Initialisation du jeu
const game = new FinalQteGame();
game.init();

export default game;