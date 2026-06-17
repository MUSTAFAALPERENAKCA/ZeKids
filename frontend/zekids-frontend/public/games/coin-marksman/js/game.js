function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/** Convert milliseconds to time string */
function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + ':' + ('0'+mins).slice(-2) + ':' + ('0'+secs).slice(-2) + '.' + ('00'+ms).slice(-3);
}

class Game extends Phaser.Scene {
    total_round = 50;
    cur_round = 0;
    platform_list = [[0, 500]];
    diamond_list = [];
    /** Init platform and diamond coordinate, store in list */
    init_list() {
        for (let i = 0; i < this.total_round-2; i++) {
            var platformLength = 300 - i * 6;
            if (platformLength < 50) {
                platformLength = 50;
            }
            var platformLeft = randomIntFromInterval(0, 499-platformLength);
            var diamondLeft = randomIntFromInterval(platformLeft+15, platformLeft+platformLength-15);
            this.platform_list.push([platformLeft, platformLength]);
            this.diamond_list.push(diamondLeft);
        }
        this.platform_list.push([225, 50]);
        this.diamond_list.push(250);
        this.platform_list.push([55, 390]);
        this.diamond_list.push(250);
    }

    preload() {
        this.init_list();
        this.load.image('sky', 'assets/sky.png');
        this.load.image('instruction', 'assets/instruction.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('gun', 'assets/gun.png');
        this.load.image('reticle', 'assets/reticle.png');
        this.load.spritesheet('player', 'assets/player.png', {frameWidth: 40, frameHeight: 96});
        this.load.spritesheet('diamond', 'assets/diamond.png', {frameWidth: 25, frameHeight: 50});

        this.load.audio('bullet', 'assets/bullet.wav');
        this.load.audio('ball', 'assets/ball.wav');
        this.load.audio('ding', 'assets/ding.wav');
        this.load.audio('glass', 'assets/glass.ogg');
        this.load.audio('applaud', 'assets/applaud.mp3');
    }

    instruction_image;
    platforms_group;
    player;
    keys;
    ball;
    gun;
    pointer;
    bullets;
    diamond;
    roundText;
    bulletsConsumption = 0;
    bulletsHit = 0;
    bulletsText;
    startTime;
    finishTime;
    timeText;
    reticle;
    hasStarted = false;
    hasFinished = false;

    prevBallSoundTime = Date.now();
    playBallSoundFunc = (ball) => {
        // Play Sound when:
        // 1. Hit left/right world bound, has velocityX
        // 2. has velocityY
        var willPlaySound = ((ball.x <= 27 || ball.x >= 473) && Math.abs(ball.body.velocity.x) > 70) || 
                (Math.abs(ball.body.velocity.y) > 70);
        // Play Sound Interval > 50ms
        willPlaySound = willPlaySound && (Date.now() - this.prevBallSoundTime > 50);
        // Play Sound after game started
        willPlaySound = willPlaySound && this.hasStarted;
        // Play Sound before game finished, or 10 seconds after game finished
        willPlaySound = willPlaySound && (!this.hasFinished || Date.now()-this.finishTime < 10000);
        if (willPlaySound) {
            this.prevBallSoundTime = Date.now();
            this.sound.play('ball', {volume: 0.35});
        }
    };

    create() {
        // Background
        this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(500, 600);

        // Instruction
        this.instruction_image = this.add.image(250, 300, 'instruction');
        
        // Round Number Text
        this.roundText = this.add.text(250, 70, '1', { fontSize: '48px', fill: '#000' }).setOrigin(0.5).setDepth(1);

        // Two Platforms
        this.platforms_group = this.physics.add.staticGroup();
        this.platforms_group.create(this.platform_list[this.cur_round][0], 450, 'platform').setOrigin(0)
        .setDisplaySize(this.platform_list[this.cur_round][1], 50).setSize(this.platform_list[this.cur_round][1], 50).refreshBody();
        this.platforms_group.create(this.platform_list[this.cur_round+1][0], 180, 'platform').setOrigin(0)
        .setDisplaySize(this.platform_list[this.cur_round+1][1], 50).setSize(this.platform_list[this.cur_round+1][1], 50).refreshBody();
        for (let i = 0; i < 2; i++) {
            this.platforms_group.children.entries[i].index = i;
        }

        // Player
        this.player = this.physics.add.sprite(100, 350, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms_group);

        // Player Anims
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 16,
            repeat: -1
        });

        this.anims.create({
            key: 'left_static',
            frames: [ { key: 'player', frame: 1 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 16,
            repeat: -1
        });

        this.anims.create({
            key: 'right_static',
            frames: [ { key: 'player', frame: 5 } ],
            frameRate: 1
        });

        // Gun
        this.gun = this.add.image(100, 350, 'gun');

        // Input Events
        this.keys = this.input.keyboard.addKeys("W,A,D");

        // Ball
        this.ball = this.physics.add.group({
            key: 'ball',
            setXY: {x: 300, y: 420},
        });
        this.ball.children.iterate(function (child) {
            child.setBounce(0.95);
            child.setCollideWorldBounds(true);
            child.setCircle(25);
        });
        this.physics.add.collider(this.ball, this.platforms_group, this.playBallSoundFunc);
        this.physics.add.collider(this.ball, this.ball);

        // Bullets
        this.bullets = this.physics.add.group();
        // Bullets hit platform
        this.physics.add.collider(this.bullets, this.platforms_group, (bullet) => {
            bullet.lifespan--;
            if (bullet.lifespan <= 0) {
                this.bullets.remove(bullet, true, true);
            }
        });
        // Bullets hit ball
        const ball_weight = 0.3;
        this.physics.add.overlap(this.bullets, this.ball, (bullet, ball) => {
            ball.setVelocityX((ball.body.velocity.x*ball_weight + bullet.body.velocity.x) / (ball_weight+1));
            ball.setVelocityY((ball.body.velocity.y*ball_weight + bullet.body.velocity.y) / (ball_weight+1));
            this.bullets.remove(bullet, true, true);
            // Set Text
            this.bulletsHit++;
            this.bulletsText.setText('Accuracy: ' + this.bulletsHit + '/' + this.bulletsConsumption + ' ' + 
            (this.bulletsHit/this.bulletsConsumption*100).toFixed(1) + '%');
            // Play Sound
            this.sound.play('ding', {volume: 0.6});
        });

        // Mouse Pointer
        this.pointer = this.input.activePointer;
        // Shoot Bullet
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', pointer => {
            if (pointer.leftButtonDown()) {
                var delta_x = this.pointer.worldX - this.player.x;
                var delta_y = this.pointer.worldY - this.player.y;
                var total = Math.sqrt(delta_x*delta_x + delta_y*delta_y);
                var velocity = 1000;
                // Create Bullet
                var bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
                bullet.lifespan = 3;
                bullet.setCircle(5);
                bullet.setBounce(0.92);
                bullet.setVelocity(velocity*delta_x/total, velocity*delta_y/total);
                // Play Bullet Sound
                this.sound.play('bullet');
                // Set Text
                this.bulletsConsumption++;
                this.bulletsText.setText('Accuracy: ' + this.bulletsHit + '/' + this.bulletsConsumption + ' ' + (this.bulletsHit/this.bulletsConsumption*100).toFixed(1) + '%');
                // Start Timer
                if (!this.hasStarted) {
                    this.hasStarted = true;
                    this.startTime = Date.now();
                }
            }
        });

        // Right Click would enter fullscreen
        this.input.on('pointerup', pointer => {
            if (pointer.rightButtonReleased()) {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                }
                else {
                    this.scale.startFullscreen();
                }
            }
        });

        // Diamond
        this.diamond = this.physics.add.staticSprite(this.diamond_list[this.cur_round], 155, 'diamond');

        // Diamond Anims
        this.anims.create({
            key: 'diamond_rotate',
            frames: this.anims.generateFrameNumbers('diamond', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.diamond.anims.play('diamond_rotate', true);

        // Ball hits diamond, goto next round
        this.physics.add.overlap(this.ball, this.diamond, () => {
            this.cur_round++;
            if (this.cur_round >= this.total_round) { // Complete all stages
                if (!this.hasFinished) {
                    this.finishTime = Date.now();
                    this.hasFinished = true;
                    var accuracyString = 'Accuracy: ' + this.bulletsHit + '/' + this.bulletsConsumption + ' ' + 
                        (this.bulletsHit/this.bulletsConsumption*100).toFixed(1) + '%';

                    // Play Glass+Applaud Sound
                    this.sound.play('glass', {volume: 0.5});
                    setTimeout(()=>{this.sound.play('applaud');}, 1000);
                    setTimeout(()=>{this.sound.play('applaud');}, 10000);

                    // Print Congratulations Text
                    const rect = this.add.rectangle(250, 280, 320, 360).setDepth(1);
                    rect.setFillStyle(0xFFFFFF, 0.7);
                    this.add.text(250, 200, "Congratulations!", { fontSize: '32px', fill: '#000' }).setOrigin(0.5).setDepth(2);
                    this.add.text(250, 270, accuracyString, { fontSize: '20px', fill: '#000' }).setOrigin(0.5).setDepth(2);
                    this.add.text(250, 300, "Time: " + msToTime(this.finishTime-this.startTime), 
                        { fontSize: '20px', fill: '#000' }).setOrigin(0.5).setDepth(2);

                    // Add Collider Between Player and Balls
                    this.physics.add.collider(this.player, this.ball);
                    // Shoot many new balls
                    var timeout = 50;
                    for (let i = 0; i < 99; i++) {
                        setTimeout(() => {
                            var new_ball = this.ball.create(this.diamond_list[this.diamond_list.length-1], 155, 'ball');
                            new_ball.setBounce(0.98);
                            new_ball.setCollideWorldBounds(true);
                            new_ball.setCircle(25);
                            var dx = Math.random() - 0.5;
                            var dy = -Math.abs(Math.random() - 0.5);
                            var total = Math.sqrt(dx*dx + dy*dy);
                            var v = 1000;
                            new_ball.setVelocity(v*dx/total, v*dy/total);
                        }, timeout);
                        timeout += 100;
                    }
                }
                return;
            }
            // Play Glass Sound
            this.sound.play('glass', {volume: 0.5});
            // Update Round Text
            this.roundText.setText(this.cur_round + 1);
            // Update Platforms
            this.platforms_group.children.iterate((child) => {
                child.index++;
                child.x = this.platform_list[child.index][0]
                child.setDisplaySize(this.platform_list[child.index][1], 50).setSize(this.platform_list[child.index][1], 50);
                child.refreshBody();
            });
            // Update Diamond
            this.diamond.x = this.diamond_list[this.cur_round];
            this.diamond.refreshBody();
            // Reset Ball
            this.ball.children.entries[0].setVelocity(0, 0);
            this.ball.children.entries[0].x = this.diamond_list[this.cur_round-1];
            this.ball.children.entries[0].y = 350;
            // Clear Bullets
            this.bullets.clear(true, true);
            // Clear Instruction
            this.instruction_image.setVisible(false);
        });

        // Bullets Text
        this.bulletsText = this.add.text(12, 16, 'Accuracy: 0/0', { fontSize: '18px', fill: '#000' }).setDepth(1);

        // Time Text
        this.timeText = this.add.text(12, 36, 'Time: '+msToTime(0), { fontSize: '18px', fill: '#000' }).setDepth(1);

        // Reticle
        this.reticle = this.add.image(0, 0, 'reticle').setDepth(3);
    }

    update() {
        // Update Time Text
        if (this.hasStarted) {
            this.timeText.setText("Time: " + msToTime(Date.now()-this.startTime));
        }

        this.gun.x = this.player.x;
        this.gun.y = this.player.y;
        var delta_x = this.pointer.worldX - this.player.x;
        var delta_y = this.pointer.worldY - this.player.y;
        // Rotate Gun
        if (delta_x == 0) {
            if (delta_y > 0) {
                this.gun.rotation = -Math.PI / 2;
            } else {
                this.gun.rotation = Math.PI / 2;
            }
        } else if (delta_x > 0) {
            this.gun.flipX = false;
            this.gun.rotation = Math.atan2(delta_y, delta_x);
        } else {
            this.gun.flipX = true;
            this.gun.rotation = Math.atan2(delta_y, delta_x) - Math.PI;
        }

        // Update Reticle
        this.reticle.x = this.pointer.worldX;
        this.reticle.y = this.pointer.worldY;

        // Control Player
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-500);
            this.player.anims.play('left', true);
            // Start Timer
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.startTime = Date.now();
            }
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(500);
            this.player.anims.play('right', true);
            // Start Timer
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.startTime = Date.now();
            }
        } else {
            this.player.setVelocityX(0);
            if (delta_x > 0) {
                this.player.anims.play('right_static', true);
            } else {
                this.player.anims.play('left_static', true);
            }
        }
        if (this.keys.W.isDown) {
            if (this.player.body.touching.down || this.player.y >= 550) {
                this.player.setVelocityY(-700);
            } else if (this.player.body.touching.left || this.player.body.touching.right) {
                this.player.setVelocityY(-350);
            }
            // Start Timer
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.startTime = Date.now();
            }
        }

        // If ball hit ground, goto previous round
        if ((!this.hasFinished) && this.ball.children.entries[0].y >= 573) {
            this.cur_round--;
            // Show Instructions on first round
            if (this.cur_round == 0) {
                this.instruction_image.setVisible(true);
            }
            // Update Round Text
            this.roundText.setText(this.cur_round + 1);
            // Update Platforms
            this.platforms_group.children.iterate((child) => {
                child.index--;
                child.x = this.platform_list[child.index][0]
                child.setDisplaySize(this.platform_list[child.index][1], 50).setSize(this.platform_list[child.index][1], 50);
                child.refreshBody();
            });
            // Update Diamond
            this.diamond.x = this.diamond_list[this.cur_round];
            this.diamond.refreshBody();
            // Move ball to top
            this.ball.children.entries[0].y = 25;
            // Clear Bullets
            this.bullets.clear(true, true);
            // If on first round, player may be stuck at bottom
            if (this.cur_round == 0 && this.player.y > 350) {
                this.player.y = 350;
            }
        }
        // Play Sound when ball hit world bound
        if (!this.hasFinished) {
            if (this.ball.children.entries[0].x <= 27 || this.ball.children.entries[0].x >= 473 ||
                this.ball.children.entries[0].y <= 27) {
                    this.playBallSoundFunc(this.ball.children.entries[0]);
            }
        }
    }
}