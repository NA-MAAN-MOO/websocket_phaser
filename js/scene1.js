class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene_1");
    }

    init() {
        // socket-io와 링크 스타~트!
        this.socket = io();

        this.playerId = null;
        this.x = null;
        this.y = null;
        this.socket.on("start", (payLoad) => {
            console.log(payLoad);
            this.playerId = payLoad.playerId;
            this.x = payLoad.x;
            this.y = payLoad.y;
        });
    }

    preload() {
        // load
        this.load.image("bg", "assets/background.png");
        this.load.spritesheet("character", "assets/character.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        this.playerFacing = {
            left: "LEFT",
            right: "RIGHT",
            up: "UP",
            down: "DOWN",
        };

        this.currentFacing = this.playerFacing.down;

        this.add.image(0, 0, "bg").setOrigin(0, 0);

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNames("character", {
                start: 0,
                end: 0,
            }),
        });
        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNames("character", {
                start: 0,
                end: 3,
            }),
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNames("character", {
                start: 4,
                end: 7,
            }),
        });
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNames("character", {
                start: 8,
                end: 11,
            }),
        });
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNames("character", {
                start: 12,
                end: 15,
            }),
        });

        this.createPlayer();
        this.physics.add.existing(this.player);

        // Phaser에서는 그룹을 제공한다. otherPlayer를 그릴때마다 그룹에 추가하여 관리하자.
        this.otherPlayers = this.physics.add.group();

        this.socket.emit("currentPlayers");

        this.socket.on("currentPlayers", (payLoad) => {
            const playerId = payLoad.playerId;
            const x = payLoad.x;
            const y = payLoad.y;
            this.addOtherPlayers({ x: x, y: y, playerId: playerId });
        });

        this.socket.on("newPlayer", (payLoad) => {
            this.addOtherPlayers({
                x: payLoad.x,
                y: payLoad.y,
                playerId: payLoad.playerId,
            });
        });

        this.socket.on("playerDisconnect", (playerId) => {
            this.removePlayer(playerId);
        });

        this.socket.on("updateLocation", (payLoad) => {
            this.updateLocation({
                x: payLoad.x,
                y: payLoad.y,
                playerId: payLoad.playerId,
                currentFacing: payLoad.currentFacing,
            });
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.right.isDown) {
            this.player.anims.play("right", true);
            this.player.body.setVelocityX(300);
            this.currentFacing = this.playerFacing.right;
            const payLoad = {
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            this.socket.emit("movement", payLoad);
        } else if (this.cursors.left.isDown) {
            this.player.anims.play("left", true);
            this.player.body.setVelocityX(-300);
            this.currentFacing = this.playerFacing.left;
            const payLoad = {
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            this.socket.emit("movement", payLoad);
        } else if (this.cursors.up.isDown) {
            this.player.anims.play("up", true);
            this.player.body.setVelocityY(-300);
            this.currentFacing = this.playerFacing.up;
            const payLoad = {
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            this.socket.emit("movement", payLoad);
        } else if (this.cursors.down.isDown) {
            this.player.anims.play("down", true);
            this.player.body.setVelocityY(300);
            this.currentFacing = this.playerFacing.down;
            const payLoad = {
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            this.socket.emit("movement", payLoad);
        } else {
            this.player.body.setVelocity(0);
        }
    }

    createPlayer() {
        this.player = this.add.sprite(this.x, this.y, "character");
    }

    addOtherPlayers(playerInfo) {
        const otherPlayer = this.add.sprite(
            playerInfo.x,
            playerInfo.y,
            "character"
        );
        otherPlayer.setTint(Math.random() * 0xffffff);
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);
    }

    removePlayer(playerId) {
        this.otherPlayers.getChildren().forEach((player) => {
            if (player.playerId === playerId) {
                player.destroy();
            }
        });
    }

    updateLocation(playerInfo) {
        this.otherPlayers.getChildren().forEach((player) => {
            if (player.playerId === playerInfo.playerId) {
                switch (playerInfo.currentFacing) {
                    case "LEFT":
                        player.anims.play("left", true);
                        player.setPosition(playerInfo.x, playerInfo.y);
                        break;
                    case "RIGHT":
                        player.anims.play("right", true);
                        player.setPosition(playerInfo.x, playerInfo.y);
                        break;
                    case "UP":
                        player.anims.play("up", true);
                        player.setPosition(playerInfo.x, playerInfo.y);
                        break;
                    case "DOWN":
                        player.anims.play("down", true);
                        player.setPosition(playerInfo.x, playerInfo.y);
                        break;
                }
            }
        });
    }
}
