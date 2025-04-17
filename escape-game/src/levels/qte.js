import {
    resizeCanvas, calculateImageDimensions, setupResizeHandler,
    canvas, ctx
} from '../ui.js';


export default class QteGame {
    constructor(config) {
        this.config = config;
        this.dimensions = null;
        this.obstacleSize = 0;
        this.gameStarted = false;
        this.obstacleTimerId = null;
        this.activeObstacles = [];
        this.score = 0;

        this.currentZoom = this.config.ZOOM.BASE;
        this.zoomTarget = this.config.ZOOM.BASE;
        this.lastZoomTime = 0;

        // Resources
        this.backgroundImage = new Image();
        this.obstacleImages = {};

        // Bind des méthodes pour préserver le contexte this
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.renderGame = this.renderGame.bind(this);
        this.startGame = this.startGame.bind(this);
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
    }

    init() {
        resizeCanvas();
        this.loadResources();
        this.updateSceneElements();
        this.setupEventListeners();
        setupResizeHandler(this.handleResize);
        requestAnimationFrame(this.renderGame);

        setTimeout(() => {
            if (!this.gameStarted) {
                this.startGame();
            }
        }, 2000);
    }

    loadResources() {
        // Charger l'image de fond
        this.backgroundImage.src = this.config.IMAGE.BACKGROUND_PATH;
        this.backgroundImage.onload = () => {
            this.updateSceneElements();
            this.gameReadyToStart = true;

            setTimeout(() => {
                if (!this.gameStarted) {
                    console.log("Démarrage automatique du jeu après chargement complet");
                    this.startGame();
                }
            }, this.config.GAME.AUTO_START_DELAY);
        };

        // Charger les images d'obstacles
        Object.entries(this.config.KEYS).forEach(([key, src]) => {
            const img = new Image();
            img.onload = () => console.log(`Image obstacle ${key} chargée: ${src}`);
            img.onerror = () => console.error(`Échec du chargement de l'image: ${src}`);
            img.src = src;
            this.obstacleImages[key] = img;
        });
    }

    updateSceneElements() {
        const calculatedDimensions = calculateImageDimensions(
            this.config.IMAGE.WIDTH,
            this.config.IMAGE.HEIGHT
        );

        this.dimensions = {
            width: calculatedDimensions.renderedImageWidth,
            height: calculatedDimensions.renderedImageHeight,
            imageX: calculatedDimensions.imageX,
            imageY: calculatedDimensions.imageY,
            renderedImageWidth: calculatedDimensions.renderedImageWidth,
            renderedImageHeight: calculatedDimensions.renderedImageHeight
        };

        this.obstacleSize = Math.min(
            this.dimensions.width,
            this.dimensions.height
        ) / this.config.OBSTACLE.SIZE_RATIO;
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    cleanupEventListeners() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    handleCanvasClick() {
        if (!this.gameStarted) this.startGame();
    }

    handleResize() {
        this.updateSceneElements();
    }

    startGame() {
        if (!this.dimensions || !this.dimensions.width || !this.dimensions.height) {
            console.warn("Impossible de démarrer le jeu : dimensions non définies");
            return;
        }

        this.gameStarted = true;
        this.activeObstacles = [];
        this.zoomTarget = this.config.ZOOM.BASE;
        this.currentZoom = this.config.ZOOM.BASE;
        this.score = 0;

        this.onGameStart();

        this.obstacleTimerId = setInterval(
            () => this.spawnObstacle(),
            this.getObstacleInterval()
        );
    }

    winGame() {
        this.gameStarted = false;
        clearInterval(this.obstacleTimerId);
        this.activeObstacles = [];

        setTimeout(() => {
            window.location.href = 'corridor.html';
        }, 500);

    }

    updateZoom() {
        const now = Date.now();
        const elapsed = now - this.lastZoomTime;

        if (this.currentZoom !== this.zoomTarget) {
            const progress = Math.min(1, elapsed / this.config.ZOOM.DURATION);
            this.currentZoom = this.currentZoom + (this.zoomTarget - this.currentZoom) * progress;

            if (Math.abs(this.currentZoom - this.zoomTarget) < 0.01) {
                this.currentZoom = this.zoomTarget;
            }
            this.lastZoomTime = now;
        }
    }

    increaseZoom() {
        this.zoomTarget = Math.min(
            this.config.ZOOM.MAX,
            this.zoomTarget + this.config.ZOOM.STEP
        );
        this.lastZoomTime = Date.now();

        this.onZoomIncreased();

        if (this.zoomTarget >= this.config.ZOOM.MAX) {
            this.winGame();
        }
    }

    spawnObstacle() {
        if (!this.dimensions || !this.dimensions.width || !this.dimensions.height) {
            console.error("Dimensions non définies");
            return;
        }

        const availableKeys = Object.keys(this.config.KEYS);
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        const obstacleImage = this.obstacleImages[randomKey];

        if (!obstacleImage) {
            console.warn(`L'image d'obstacle ${randomKey} n'est pas disponible`);
            return;
        }

        const maxX = Math.max(0, this.dimensions.width - this.obstacleSize);
        const maxY = Math.max(0, this.dimensions.height - this.obstacleSize);
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        const obstacle = {
            x, y,
            width: this.obstacleSize,
            height: this.obstacleSize,
            key: randomKey,
            img: obstacleImage,
            expireTime: Date.now() + this.getObstacleLifetime(),
            color: `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
        };

        this.activeObstacles.push(obstacle);
        console.log(`Obstacle créé: touche=${randomKey}, pos=(${x},${y}), total=${this.activeObstacles.length}`);

        setTimeout(() => {
            const index = this.activeObstacles.indexOf(obstacle);
            if (index !== -1) {
                this.activeObstacles.splice(index, 1);
                console.log(`Obstacle expiré, reste: ${this.activeObstacles.length}`);
                this.onObstacleExpired();
            }
        }, this.getObstacleLifetime());
    }

    handleKeyPress(event) {
        if (!this.gameStarted) {
            this.startGame();
            return;
        }

        const key = event.key.toUpperCase();
        const availableKeys = Object.keys(this.config.KEYS);
        let obstacleHit = false;

        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = this.activeObstacles[i];
            if (obstacle.key === key) {
                this.activeObstacles.splice(i, 1);
                this.score++;
                console.log(`Touche ${key} appuyée! Score: ${this.score}`);
                this.increaseZoom();
                obstacleHit = true;
                break;
            }
        }

        if (!obstacleHit && availableKeys.includes(key)) {
            this.onWrongKeyPressed();
        }
    }

    renderGame() {
        this.updateZoom();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.renderBackground();

        if (this.gameStarted) {
            this.renderObstacles();
            this.renderUI();
        }

        this.renderEffects();

        requestAnimationFrame(this.renderGame);
    }

    renderBackground() {
        if (!this.dimensions) return;

        const zoomOffsetX = (this.dimensions.width * this.currentZoom - this.dimensions.width) / 2;
        const zoomOffsetY = 0;

        ctx.drawImage(
            this.backgroundImage,
            0 - zoomOffsetX, 0 - zoomOffsetY,
            this.dimensions.width * this.currentZoom,
            this.dimensions.height * this.currentZoom
        );
    }


    renderObstacles() {
        if (this.activeObstacles.length === 0) return;

        const now = Date.now();

        this.activeObstacles.forEach(obstacle => {
            if (obstacle.img && obstacle.img.complete) {
                // Calculer le pourcentage de temps restant
                const timeRemaining = obstacle.expireTime - now;
                const percentRemaining = timeRemaining / this.getObstacleLifetime();

                // Dessiner l'image de l'obstacle
                ctx.drawImage(
                    obstacle.img,
                    obstacle.x, obstacle.y,
                    obstacle.width, obstacle.height
                );

                // Dessiner le timer circulaire
                this.drawTimerCircle(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    Math.max(obstacle.width, obstacle.height) / 2 + 5,
                    percentRemaining,
                    obstacle.color || 'lime'
                );
            } else {
                // Rectangle visible si l'image n'est pas disponible
                ctx.fillStyle = obstacle.color || 'magenta';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }

    drawTimerCircle(centerX, centerY, radius, percentRemaining, color) {
        ctx.beginPath();
        ctx.arc(
            centerX, centerY, radius,
            -Math.PI / 2,
            -Math.PI / 2 + percentRemaining * 2 * Math.PI,
            false
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    renderUI() {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, 20, 30);
        ctx.fillText(`Obstacles: ${this.activeObstacles.length}`, 20, 60);
        ctx.fillText(`Zoom: ${Math.round(this.currentZoom * 100)}%`, 20, 90);
    }

    renderEffects() {
        // À implémenter dans les classes enfants si nécessaire
    }

    // Méthodes à surcharger dans les classes dérivées
    onGameStart() {
    }

    onZoomIncreased() {
    }

    onObstacleExpired() {
    }

    onWrongKeyPressed() {
    }

    getObstacleInterval() {
        return this.config.OBSTACLE.BASE_INTERVAL || 1500;
    }

    getObstacleLifetime() {
        return this.config.OBSTACLE.BASE_LIFETIME || 1200;
    }
}