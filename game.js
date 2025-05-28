class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 662;
        this.canvas.height = 666;

        // Initialize birdFrames as an empty array
        this.birdFrames = [];
        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            img.src = `assets/bird${i}.png`;
            this.birdFrames.push(img);
        }

        // Load generated assets
        this.assets = {
            bird: new Image(),
            background: new Image(),
            pipeTop: new Image(),
            pipeBottom: new Image(),
            ground: new Image(),
            pipe: new Image()
        };
        this.assets.bird.src = window.assets.bird;
        this.assets.background.src = window.assets.background;
        this.assets.pipeTop.src = window.assets.pipeTop;
        this.assets.pipeBottom.src = window.assets.pipeBottom;
        this.assets.ground.src = window.assets.ground;
        this.assets.pipe.src = 'assets/pipe.png';

        // Game state
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            velocity: 0,
            gravity: 0.103044152,
            jump: -4.051086675,
            rotation: 0,
            frame: 0,
            frameCount: 8,
            frameDelay: 5,
            frameCounter: 0
        };

        this.ground = {
            x: 0,
            y: this.canvas.height - 112
        };

        this.pipes = [];
        this.score = 0;
        this.highScore = localStorage.getItem('flappyHighScore') || 0;
        this.gameOver = false;
        this.gameState = 'welcome';

        // Update high score display
        document.getElementById('highScoreValue').textContent = this.highScore;

        // Event listeners
        this.canvas.addEventListener('click', () => this.handleInput());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.handleInput();
        });

        // Start game loop
        this.update();
    }

    jump() {
        if (this.gameOver) {
            this.reset();
            return;
        }
        this.bird.velocity = this.bird.jump;
        this.bird.y += this.bird.jump * 1.1; // Move up a bit more instantly
        window.sounds.flap();
    }

    reset() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.score = 0;
        document.getElementById('scoreValue').textContent = '0';
        // Optionally reset other variables if needed
    }

    update() {
        if (this.gameState === 'playing') {
            // Animate ground
            this.ground.x = (this.ground.x - 1.64) % 24;

            // Animate bird
            this.bird.frameCounter++;
            if (this.bird.frameCounter >= this.bird.frameDelay) {
                this.bird.frame = (this.bird.frame + 1) % this.bird.frameCount;
                this.bird.frameCounter = 0;
            }

            // Bird physics
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
            this.bird.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, this.bird.velocity * 0.1));

            // Prevent bird from going above the screen
            if (this.bird.y < 0) {
                this.bird.y = 0;
                this.bird.velocity = 0; // Stop upward movement
            }

            // Check collision with ground only
            if (this.bird.y + 24 > this.ground.y) {
                this.gameState = 'gameover';
                window.sounds.hit();
            }

            // Generate pipes
            const pipeSpacing = 230; // 15% more than 200
            if (
                this.pipes.length === 0 ||
                this.pipes[this.pipes.length - 1].x < this.canvas.width - pipeSpacing
            ) {
                const gap = 150;
                const pipeHeight = Math.random() * (this.canvas.height - gap - 200) + 100;
                this.pipes.push({
                    x: this.canvas.width,
                    topHeight: pipeHeight,
                    bottomY: pipeHeight + gap,
                    passed: false
                });
            }

            // Update pipes
            for (let pipe of this.pipes) {
                pipe.x -= 1.64;

                // Check collision with pipes
                if (this.bird.x + 24 > pipe.x &&
                    this.bird.x < pipe.x + 52) {
                    if (this.bird.y < pipe.topHeight ||
                        this.bird.y + 24 > pipe.bottomY) {
                        this.gameState = 'gameover';
                        window.sounds.hit();
                    }
                }

                // Update score
                if (!pipe.passed && pipe.x < this.bird.x) {
                    pipe.passed = true;
                    this.score++;
                    document.getElementById('scoreValue').textContent = this.score;
                    window.sounds.score();

                    // Update high score
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('flappyHighScore', this.highScore);
                        document.getElementById('highScoreValue').textContent = this.highScore;
                    }
                }
            }

            // Remove off-screen pipes
            this.pipes = this.pipes.filter(pipe => pipe.x > -52);
        } else if (this.gameState === 'welcome') {
            // Animate ground
            this.ground.x = (this.ground.x - 1.64) % 24;

            // Animate bird (flap)
            this.bird.frameCounter++;
            if (this.bird.frameCounter >= this.bird.frameDelay) {
                this.bird.frame = (this.bird.frame + 1) % this.bird.frameCount;
                this.bird.frameCounter = 0;
            }

            // Bird floats in place, no gravity, no rotation
            this.bird.velocity = 0;
            this.bird.rotation = 0;
            this.bird.y = this.canvas.height / 2 + Math.sin(Date.now() / 250) * 8;
        }

        this.draw();
        requestAnimationFrame(() => this.update());
    }

    draw() {
        // Draw background
        this.ctx.drawImage(this.assets.background, 0, 0, this.canvas.width, this.canvas.height);

        // Draw pipes
        if (this.gameState === 'playing' || this.gameState === 'gameover') {
            const pipeWidth = 64;   // Reduced by 20%
            const pipeHeight = 400; // Or whatever height you use

            for (let pipe of this.pipes) {
                // Top pipe
                drawStyledPipe(this.ctx, pipe.x, pipe.topHeight - pipeHeight, pipeWidth, pipeHeight, true);
                // Bottom pipe
                drawStyledPipe(this.ctx, pipe.x, pipe.bottomY, pipeWidth, this.canvas.height - pipe.bottomY, false);
            }
        }

        // Draw ground
        const groundImg = new Image();
        groundImg.src = window.assets.ground;
        const groundY = this.canvas.height - 112;
        let groundX = this.ground.x;

        while (groundX < this.canvas.width) {
            this.ctx.drawImage(groundImg, groundX, groundY);
            groundX += 48; // tile width
        }

        // Draw bird using the current frame
        const frameImg = this.birdFrames[this.bird.frame];
        const targetWidth = 40;
        const targetHeight = 28;

        if (frameImg && frameImg.complete && frameImg.naturalWidth !== 0) {
            this.ctx.save();
            this.ctx.translate(
                this.bird.x + targetWidth / 2,
                this.bird.y + targetHeight / 2
            );
            this.ctx.rotate(this.bird.rotation);
            this.ctx.drawImage(
                frameImg,
                0, 0, frameImg.width, frameImg.height, // source image
                -targetWidth / 2, -targetHeight / 2,  // destination position
                targetWidth, targetHeight              // destination size
            );
            this.ctx.restore();
        }

        // Draw game over message
        if (this.gameState === 'gameover') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Game Over! Click to restart',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }

        // Draw welcome message
        if (this.gameState === 'welcome') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Click or press space bar to begin',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }

    handleInput() {
        if (this.gameState === 'welcome') {
            this.gameState = 'playing';
        } else if (this.gameState === 'playing') {
            this.jump();
        } else if (this.gameState === 'gameover') {
            this.reset();
            this.gameState = 'welcome';
        }
    }
}

function drawPipe(ctx, x, y, width, height, isTop) {
    // Pipe body
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(x, y, width, height);

    // Pipe shadow
    ctx.fillStyle = '#4a8a1d';
    ctx.fillRect(x + width - 8, y, 8, height);

    // Pipe highlight
    ctx.fillStyle = '#b6ff7e';
    ctx.fillRect(x + 4, y, 4, height);

    // Pipe lip
    ctx.fillStyle = '#5ee432';
    if (isTop) {
        ctx.fillRect(x - 4, y + height - 12, width + 8, 12);
    } else {
        ctx.fillRect(x - 4, y, width + 8, 12);
    }
}

function drawStyledPipe(ctx, x, y, width, height, isTop) {
    // Colors
    const mainGreen = "#8be04e";
    const darkGreen = "#3a3a3a";
    const highlight = "#d6ffb3";
    const midHighlight = "#b6e87a";

    // Draw pipe body
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = mainGreen;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = darkGreen;
    ctx.stroke();

    // Vertical highlights
    ctx.fillStyle = highlight;
    ctx.fillRect(x + width * 0.18, y, width * 0.12, height);
    ctx.fillStyle = midHighlight;
    ctx.fillRect(x + width * 0.38, y, width * 0.08, height);
    ctx.fillStyle = "#a3d977";
    ctx.fillRect(x + width * 0.65, y, width * 0.07, height);

    // Draw pipe lip (rim)
    ctx.beginPath();
    if (isTop) {
        ctx.rect(x - 6, y + height - 16, width + 12, 16);
    } else {
        ctx.rect(x - 6, y, width + 12, 16);
    }
    ctx.fillStyle = mainGreen;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = darkGreen;
    ctx.stroke();

    // Lip highlight
    ctx.fillStyle = highlight;
    if (isTop) {
        ctx.fillRect(x + 4, y + height - 12, width * 0.2, 8);
    } else {
        ctx.fillRect(x + 4, y + 4, width * 0.2, 8);
    }

    ctx.restore();
}

function createGroundTile() {
    const width = 48;   // tile width
    const height = 112; // ground height
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw base (dirt)
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, 0, width, height);

    // Draw green top stripe
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, 0, width, 20);

    // Draw dark outline at the top
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(width, 20);
    ctx.stroke();

    return canvas.toDataURL();
}

function createPyramidBackground() {
    const width = 662;   // match your canvas width
    const height = 666;  // match your canvas height
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Sky
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, width, height);

    // --- Draw blocky pyramids ---
    const baseY = height - 112; // ground height offset
    const pyramidBase = 160;    // width of pyramid base (bigger)
    const pyramidHeight = 140;  // height of pyramid (bigger)
    const pyramidColors = ['#e6c97a', '#d2b16d', '#c2a05a'];

    for (let i = -pyramidBase/2; i < width; i += pyramidBase - 20) {
        // Main pyramid
        ctx.fillStyle = pyramidColors[Math.floor(Math.random() * pyramidColors.length)];
        ctx.beginPath();
        ctx.moveTo(i, baseY);
        ctx.lineTo(i + pyramidBase, baseY);
        ctx.lineTo(i + pyramidBase / 2, baseY - pyramidHeight);
        ctx.closePath();
        ctx.fill();

        // Blocky steps (pixel-art style)
        ctx.fillStyle = "#f7e9a0";
        for (let step = 0; step < 6; step++) {
            let stepHeight = pyramidHeight / 6;
            let y = baseY - step * stepHeight;
            let left = i + (step * (pyramidBase / 12));
            let right = i + pyramidBase - (step * (pyramidBase / 12));
            ctx.fillRect(left, y - stepHeight, right - left, stepHeight);
        }

        // Shadow for depth
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.beginPath();
        ctx.moveTo(i + pyramidBase / 2, baseY - pyramidHeight);
        ctx.lineTo(i + pyramidBase, baseY);
        ctx.lineTo(i + pyramidBase * 0.75, baseY);
        ctx.closePath();
        ctx.fill();
    }

    return canvas.toDataURL();
}

// Start the game when the page loads
window.onload = () => {
    new FlappyBird();
    window.assets.ground = createGroundTile();
    window.assets.background = createPyramidBackground();
}; 