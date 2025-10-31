// Knight's Adventure Game - Fixed Version
class FixedKnightGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.keysPressed = {};
        
        // Game state
        this.score = 0;
        this.enemiesKilled = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.spawnRate = 240;
        this.gameRunning = true;
        this.gameOver = false;
        
        // Enhanced knight with better jump
        this.knight = {
            x: 200,
            y: 600,
            width: 40,
            height: 50,
            vx: 0,
            vy: 0,
            speed: 6,
            jumpPower: 22, // Increased jump power
            health: 100,
            maxHealth: 100,
            facing: 1,
            isAttacking: false,
            attackTimer: 0,
            attackCooldown: 0,
            invulnerable: false,
            invulnerabilityTimer: 0,
            onGround: false,
            animFrame: 0,
            animTimer: 0,
            comboCount: 0
        };
        
        // World
        this.world = {
            width: 1200,
            height: 800,
            groundY: 720
        };
        
        // Platforms
        this.platforms = [
            {x: 300, y: 600, width: 200, height: 20},
            {x: 600, y: 500, width: 150, height: 20},
            {x: 900, y: 580, width: 180, height: 20},
            {x: 100, y: 450, width: 120, height: 20},
            {x: 800, y: 350, width: 160, height: 20}
        ];
        
        // Game objects
        this.enemies = [];
        this.particles = [];
        this.attacks = [];
        this.backgroundElements = [];
        
        this.init();
        this.setupEvents();
        this.gameLoop();
    }
    
    init() {
        // Create simple background without problematic elements
        this.createSimpleBackground();
        
        // Spawn initial enemies
        this.spawnEnemy();
        this.spawnEnemy();
        
        console.log('Fixed game initialized!');
    }
    
    createSimpleBackground() {
        // Simple trees without complex shapes
        for (let i = 0; i < 6; i++) {
            this.backgroundElements.push({
                type: 'tree',
                x: 100 + i * 200,
                y: this.world.groundY - 60,
                size: 30
            });
        }
        
        // Simple clouds
        for (let i = 0; i < 3; i++) {
            this.backgroundElements.push({
                type: 'cloud',
                x: 200 + i * 400,
                y: 80 + i * 30,
                size: 50,
                speed: 0.3
            });
        }
    }
    
    setupEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.keysPressed[e.code]) {
                this.keysPressed[e.code] = true;
                
                // Restart game
                if (e.code === 'KeyR' && this.gameOver) {
                    this.restart();
                }
            }
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysPressed[e.code] = false;
        });
    }
    
    restart() {
        this.score = 0;
        this.enemiesKilled = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.spawnRate = 240;
        this.gameRunning = true;
        this.gameOver = false;
        
        this.knight.x = 200;
        this.knight.y = 600;
        this.knight.health = 100;
        this.knight.vx = 0;
        this.knight.vy = 0;
        
        this.enemies = [];
        this.particles = [];
        this.attacks = [];
        
        this.spawnEnemy();
        this.spawnEnemy();
    }
    
    spawnEnemy() {
        const types = ['goblin', 'orc', 'slime', 'skeleton'];
        const type = types[Math.floor(Math.random() * types.length)];
        const side = Math.random() > 0.5;
        const x = side ? -50 : this.world.width + 50;
        
        let enemy = {
            x: x,
            y: this.world.groundY - 40,
            type: type,
            vx: 0,
            vy: 0,
            onGround: false,
            animFrame: 0,
            animTimer: 0,
            behaviorTimer: 0,
            health: 1,
            maxHealth: 1
        };
        
        // Set type-specific properties
        switch (type) {
            case 'goblin':
                enemy.width = 30;
                enemy.height = 35;
                enemy.speed = 2.5;
                enemy.damage = 15;
                enemy.points = 10;
                break;
            case 'orc':
                enemy.width = 45;
                enemy.height = 55;
                enemy.speed = 1.8;
                enemy.damage = 25;
                enemy.points = 25;
                enemy.health = 2;
                enemy.maxHealth = 2;
                break;
            case 'slime':
                enemy.width = 25;
                enemy.height = 25;
                enemy.speed = 1.2;
                enemy.damage = 10;
                enemy.points = 5;
                break;
            case 'skeleton':
                enemy.width = 35;
                enemy.height = 45;
                enemy.speed = 3;
                enemy.damage = 20;
                enemy.points = 15;
                break;
        }
        
        this.enemies.push(enemy);
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.gameTime++;
        
        // Update knight
        this.updateKnight();
        
        // Update enemies
        this.updateEnemies();
        
        // Update attacks
        this.updateAttacks();
        
        // Update particles
        this.updateParticles();
        
        // Update background
        this.updateBackground();
        
        // Handle spawning
        this.handleSpawning();
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateUI();
        
        // Check game over
        if (this.knight.health <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.gameRunning = false;
        }
    }
    
    updateKnight() {
        const knight = this.knight;
        
        // Input handling with better jump
        let moving = false;
        
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            knight.vx = Math.max(knight.vx - 0.8, -knight.speed);
            knight.facing = -1;
            moving = true;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            knight.vx = Math.min(knight.vx + 0.8, knight.speed);
            knight.facing = 1;
            moving = true;
        }
        
        // Better jumping - only when on ground and key pressed
        if ((this.keys['KeyW'] || this.keys['ArrowUp']) && knight.onGround) {
            knight.vy = -knight.jumpPower; // Higher jump
            knight.onGround = false;
        }
        
        // Attack with cooldown
        if (this.keys['Space'] && knight.attackCooldown <= 0) {
            knight.isAttacking = true;
            knight.attackTimer = 25;
            knight.attackCooldown = 30;
            
            // Create attack
            this.attacks.push({
                x: knight.x + (knight.facing > 0 ? knight.width : -30),
                y: knight.y + 15,
                width: 30,
                height: 25,
                timer: 20,
                facing: knight.facing
            });
        }
        
        // Physics with lighter gravity for better jump feel
        knight.vy += 0.7; // Reduced gravity for better jumps
        knight.x += knight.vx;
        knight.y += knight.vy;
        
        // Better friction
        if (!moving) {
            knight.vx *= 0.82;
        }
        
        // Ground and platform collision
        this.checkKnightCollisions();
        
        // Boundaries
        if (knight.x < 0) knight.x = 0;
        if (knight.x > this.world.width - knight.width) {
            knight.x = this.world.width - knight.width;
        }
        
        // Update timers
        if (knight.attackTimer > 0) knight.attackTimer--;
        else knight.isAttacking = false;
        
        if (knight.attackCooldown > 0) knight.attackCooldown--;
        
        if (knight.invulnerable) {
            knight.invulnerabilityTimer--;
            if (knight.invulnerabilityTimer <= 0) {
                knight.invulnerable = false;
            }
        }
        
        // Animation
        knight.animTimer++;
        if (knight.animTimer >= 8) {
            knight.animFrame = (knight.animFrame + 1) % 4;
            knight.animTimer = 0;
        }
    }
    
    checkKnightCollisions() {
        const knight = this.knight;
        knight.onGround = false;
        
        // Ground collision
        if (knight.y + knight.height >= this.world.groundY) {
            knight.y = this.world.groundY - knight.height;
            knight.vy = 0;
            knight.onGround = true;
        }
        
        // Platform collisions
        this.platforms.forEach(platform => {
            if (knight.x < platform.x + platform.width &&
                knight.x + knight.width > platform.x &&
                knight.y < platform.y + platform.height &&
                knight.y + knight.height > platform.y) {
                
                // Landing on top
                if (knight.vy > 0 && knight.y < platform.y) {
                    knight.y = platform.y - knight.height;
                    knight.vy = 0;
                    knight.onGround = true;
                }
            }
        });
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            // Simple AI - move towards knight
            const dx = this.knight.x - enemy.x;
            const distance = Math.abs(dx);
            
            if (distance > 10) {
                enemy.vx = dx > 0 ? enemy.speed : -enemy.speed;
            }
            
            // Physics
            enemy.vy += 0.9;
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            
            // Ground collision
            enemy.onGround = false;
            if (enemy.y + enemy.height >= this.world.groundY) {
                enemy.y = this.world.groundY - enemy.height;
                enemy.vy = 0;
                enemy.onGround = true;
            }
            
            // Platform collisions
            this.platforms.forEach(platform => {
                if (enemy.x < platform.x + platform.width &&
                    enemy.x + enemy.width > platform.x &&
                    enemy.y < platform.y + platform.height &&
                    enemy.y + enemy.height > platform.y) {
                    
                    if (enemy.vy > 0 && enemy.y < platform.y) {
                        enemy.y = platform.y - enemy.height;
                        enemy.vy = 0;
                        enemy.onGround = true;
                    }
                }
            });
            
            // Remove if too far
            if (enemy.x < -200 || enemy.x > this.world.width + 200) {
                this.enemies.splice(index, 1);
            }
            
            // Animation
            enemy.animTimer++;
            if (enemy.animTimer >= 15) {
                enemy.animFrame = (enemy.animFrame + 1) % 4;
                enemy.animTimer = 0;
            }
        });
    }
    
    updateAttacks() {
        this.attacks = this.attacks.filter(attack => {
            attack.timer--;
            return attack.timer > 0;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            return particle.life > 0;
        });
    }
    
    updateBackground() {
        this.backgroundElements.forEach(element => {
            if (element.type === 'cloud') {
                element.x += element.speed;
                if (element.x > this.world.width + element.size) {
                    element.x = -element.size;
                }
            }
        });
    }
    
    handleSpawning() {
        this.spawnTimer++;
        
        // Increase difficulty over time
        if (this.gameTime % 1800 === 0) {
            this.wave++;
            this.spawnRate = Math.max(120, this.spawnRate - 30);
        }
        
        // Spawn enemies
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnEnemy();
            this.spawnTimer = 0;
            
            // Multiple spawns in higher waves
            if (this.wave > 2 && Math.random() < 0.4) {
                setTimeout(() => this.spawnEnemy(), 60);
            }
        }
    }
    
    checkCollisions() {
        // Knight attacks vs enemies
        this.attacks.forEach(attack => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(attack, enemy)) {
                    // Hit enemy
                    enemy.health--;
                    this.createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.enemiesKilled++;
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
            });
        });
        
        // Enemies vs knight
        this.enemies.forEach(enemy => {
            if (this.isColliding(this.knight, enemy) && !this.knight.invulnerable) {
                this.knight.health -= enemy.damage;
                this.knight.invulnerable = true;
                this.knight.invulnerabilityTimer = 90;
                this.createBloodEffect(this.knight.x + this.knight.width/2, this.knight.y + this.knight.height/2);
                
                if (this.knight.health < 0) {
                    this.knight.health = 0;
                }
            }
        });
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 3,
                color: '#FFD700',
                life: 40,
                size: Math.random() * 6 + 3
            });
        }
    }
    
    createBloodEffect(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                color: '#DC143C',
                life: 30,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    updateUI() {
        document.getElementById('health').textContent = this.knight.health;
        document.getElementById('score').textContent = this.score;
        document.getElementById('killed').textContent = this.enemiesKilled;
        document.getElementById('wave').textContent = this.wave;
        
        // Update health bar
        const healthPercent = (this.knight.health / this.knight.maxHealth) * 100;
        document.getElementById('healthBar').style.width = healthPercent + '%';
    }    
   
 render() {
        // Clear canvas with simple gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.world.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.world.width, this.world.height);
        
        // Draw simple background
        this.drawSimpleBackground();
        
        // Draw platforms
        this.drawPlatforms();
        
        // Draw ground
        this.drawGround();
        
        // Draw knight
        this.drawKnight();
        
        // Draw enemies
        this.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        // Draw attacks
        this.attacks.forEach(attack => this.drawAttack(attack));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Game over screen
        if (this.gameOver) {
            this.drawGameOverScreen();
        }
    }
    
    drawSimpleBackground() {
        // Simple trees
        this.backgroundElements.forEach(element => {
            if (element.type === 'tree') {
                // Tree trunk
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(element.x, element.y, 8, element.size);
                
                // Tree crown - simple rectangle
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(element.x - 10, element.y - 15, 28, 20);
                
                // Tree highlight
                this.ctx.fillStyle = '#32CD32';
                this.ctx.fillRect(element.x - 5, element.y - 10, 18, 10);
            } else if (element.type === 'cloud') {
                // Simple cloud - just rectangles
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fillRect(element.x, element.y, element.size, 20);
                this.ctx.fillRect(element.x + 10, element.y - 5, element.size - 20, 15);
                this.ctx.fillRect(element.x + 20, element.y + 5, element.size - 40, 10);
            }
        });
    }
    
    drawPlatforms() {
        this.platforms.forEach(platform => {
            // Platform base
            this.ctx.fillStyle = '#696969';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Platform highlight
            this.ctx.fillStyle = '#A9A9A9';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 4);
            
            // Platform edge
            this.ctx.fillStyle = '#2F4F4F';
            this.ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
        });
    }
    
    drawGround() {
        // Ground base
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.world.groundY, this.world.width, this.world.height - this.world.groundY);
        
        // Grass layer
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.world.groundY, this.world.width, 15);
        
        // Simple grass details
        this.ctx.fillStyle = '#32CD32';
        for (let x = 0; x < this.world.width; x += 30) {
            this.ctx.fillRect(x, this.world.groundY, 2, 8);
            this.ctx.fillRect(x + 10, this.world.groundY, 2, 6);
            this.ctx.fillRect(x + 20, this.world.groundY, 2, 10);
        }
    }
    
    drawKnight() {
        const knight = this.knight;
        
        this.ctx.save();
        
        // Flicker when invulnerable
        if (knight.invulnerable && Math.floor(knight.invulnerabilityTimer / 5) % 2) {
            this.ctx.globalAlpha = 0.6;
        }
        
        // Body (armor)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(knight.x + 8, knight.y + 20, 24, 25);
        
        // Chest plate
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(knight.x + 10, knight.y + 22, 20, 20);
        
        // Helmet
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(knight.x + 6, knight.y + 5, 28, 20);
        
        // Visor
        this.ctx.fillStyle = '#000080';
        this.ctx.fillRect(knight.x + 10, knight.y + 10, 20, 6);
        
        // Plume
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(knight.x + 18, knight.y, 4, 10);
        
        // Arms
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(knight.x + 2, knight.y + 25, 8, 15);
        this.ctx.fillRect(knight.x + 30, knight.y + 25, 8, 15);
        
        // Legs
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(knight.x + 10, knight.y + 45, 8, 5);
        this.ctx.fillRect(knight.x + 22, knight.y + 45, 8, 5);
        
        // Sword when attacking
        if (knight.isAttacking) {
            const swordX = knight.facing > 0 ? knight.x + knight.width : knight.x - 30;
            
            // Sword blade
            this.ctx.fillStyle = '#C0C0C0';
            this.ctx.fillRect(swordX, knight.y + 10, 30, 6);
            
            // Sword handle
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(swordX + (knight.facing > 0 ? 25 : 0), knight.y + 8, 8, 10);
            
            // Sword guard
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(swordX + (knight.facing > 0 ? 23 : 2), knight.y + 9, 4, 8);
        }
        
        this.ctx.restore();
    }
    
    drawEnemy(enemy) {
        switch (enemy.type) {
            case 'goblin':
                // Body
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(enemy.x + 6, enemy.y + 20, 18, 15);
                // Head
                this.ctx.fillStyle = '#90EE90';
                this.ctx.fillRect(enemy.x + 3, enemy.y + 5, 24, 18);
                // Eyes
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(enemy.x + 8, enemy.y + 10, 4, 4);
                this.ctx.fillRect(enemy.x + 18, enemy.y + 10, 4, 4);
                // Ears
                this.ctx.fillStyle = '#90EE90';
                this.ctx.fillRect(enemy.x, enemy.y + 10, 4, 8);
                this.ctx.fillRect(enemy.x + 26, enemy.y + 10, 4, 8);
                break;
                
            case 'orc':
                // Body
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(enemy.x + 8, enemy.y + 25, 29, 20);
                // Head
                this.ctx.fillStyle = '#8FBC8F';
                this.ctx.fillRect(enemy.x + 6, enemy.y + 5, 33, 25);
                // Eyes
                this.ctx.fillStyle = '#FF4500';
                this.ctx.fillRect(enemy.x + 12, enemy.y + 12, 6, 6);
                this.ctx.fillRect(enemy.x + 27, enemy.y + 12, 6, 6);
                // Tusks
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(enemy.x + 16, enemy.y + 22, 3, 8);
                this.ctx.fillRect(enemy.x + 26, enemy.y + 22, 3, 8);
                break;
                
            case 'slime':
                // Body
                this.ctx.fillStyle = '#32CD32';
                this.ctx.fillRect(enemy.x, enemy.y + 8, enemy.width, enemy.height - 8);
                // Highlight
                this.ctx.fillStyle = '#90EE90';
                this.ctx.fillRect(enemy.x + 3, enemy.y + 11, 8, 8);
                // Eyes
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(enemy.x + 6, enemy.y + 12, 3, 3);
                this.ctx.fillRect(enemy.x + 16, enemy.y + 12, 3, 3);
                break;
                
            case 'skeleton':
                // Body
                this.ctx.fillStyle = '#F5F5DC';
                this.ctx.fillRect(enemy.x + 8, enemy.y + 20, 19, 20);
                // Head
                this.ctx.fillStyle = '#F5F5DC';
                this.ctx.fillRect(enemy.x + 6, enemy.y + 5, 23, 20);
                // Eye sockets
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 5, 5);
                this.ctx.fillRect(enemy.x + 20, enemy.y + 10, 5, 5);
                // Glowing eyes
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(enemy.x + 11, enemy.y + 11, 3, 3);
                this.ctx.fillRect(enemy.x + 21, enemy.y + 11, 3, 3);
                break;
        }
        
        // Health bar for stronger enemies
        if (enemy.maxHealth > 1) {
            const healthPercent = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : '#FF0000';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
        }
    }
    
    drawAttack(attack) {
        this.ctx.save();
        this.ctx.globalAlpha = attack.timer / 20;
        
        // Simple sword slash
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        
        const startAngle = attack.facing > 0 ? -Math.PI/3 : -2*Math.PI/3;
        const endAngle = attack.facing > 0 ? Math.PI/3 : -Math.PI/3;
        
        this.ctx.arc(attack.x, attack.y, 25, startAngle, endAngle);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life / 40;
        
        // Simple particle
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        
        this.ctx.restore();
    }
    
    drawGameOverScreen() {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.world.width, this.world.height);
        
        // Game over panel
        const panelWidth = 600;
        const panelHeight = 400;
        const panelX = (this.world.width - panelWidth) / 2;
        const panelY = (this.world.height - panelHeight) / 2;
        
        // Panel background
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Title
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.world.width/2, panelY + 80);
        
        // Stats
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '24px Courier New';
        this.ctx.fillText(`Final Score: ${this.score}`, this.world.width/2, panelY + 150);
        this.ctx.fillText(`Enemies Defeated: ${this.enemiesKilled}`, this.world.width/2, panelY + 190);
        this.ctx.fillText(`Wave Reached: ${this.wave}`, this.world.width/2, panelY + 230);
        
        // Instructions
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Courier New';
        this.ctx.fillText('Press R to Restart', this.world.width/2, panelY + 300);
        
        this.ctx.textAlign = 'left';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    console.log('Starting Knight Adventure Game...');
    new FixedKnightGame();
});