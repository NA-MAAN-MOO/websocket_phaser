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
            this.playerId = payLoad.playerId;
            this.x = payLoad.x;
            this.y = payLoad.y;
        });
        // let HOST = location.origin.replace(/^http/, "ws");
        // this.ws = new WebSocket(HOST);
        // // this.ws = new WebSocket("ws://localhost:9090"); // 웹소캣 객체 생성
        // this.ws.onmessage = (message) => {
        //     const response = JSON.parse(message.data);

        //     if (response.method === "connect") {
        //         this.playerId = response.playerId;
        //         this.x = response.x;
        //         this.y = response.y;
        //     }
        // };
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

        // create
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        // this.player = this.add.sprite(200, 200, "character"); // init() 에서 생성해주기 때문에 주석처리
        // this.physics.add.existing(this.player);

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

        // This line creates a new Websocket variable,
        // this.ws specifies the name of the variable,
        // and will be a class variable with the this keyword.
        // Localhost:9090 is just a random port,
        // it does not have to be 9090, could be port 3000, 5000, or any port you want.
        // this.ws = new WebSocket("ws://localhost:9090");

        this.createPlayer();
        this.physics.add.existing(this.player);

        // Phaser에서는 그룹을 제공한다. otherPlayer를 그릴때마다 그룹에 추가하여 관리하자.
        this.otherPlayers = this.physics.add.group();

        const payLoad = {
            method: "currentPlayers",
        };
        // this.ws.send(JSON.stringify(payLoad));

        // this.ws.onmessage = (message) => {
        //     const response = JSON.parse(message.data);

        //     if (response.method === "currentPlayers") {
        //         const playerId = response.playerId;
        //         const x = response.x;
        //         const y = response.y;
        //         this.addOtherPlayers({ x: x, y: y, playerId: playerId });
        //     }

        //     if (response.method === "newPlayer") {
        //         console.log(response.playerId);
        //         this.addOtherPlayers({
        //             x: response.x,
        //             y: response.y,
        //             playerId: response.playerId,
        //         });
        //     }

        //     if (response.method === "disconnect") {
        //         this.removePlayer(response.playerId);
        //     }

        //     if (response.method === "updateLocation") {
        //         this.updateLocation({
        //             x: response.x,
        //             y: response.y,
        //             playerId: response.playerId,
        //             currentFacing: response.currentFacing,
        //         });
        //     }
        // };

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.right.isDown) {
            this.player.anims.play("right", true);
            this.player.body.setVelocityX(300);
            this.currentFacing = this.playerFacing.right;
            const payLoad = {
                method: "movement",
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            // this.ws.send(JSON.stringify(payLoad));
        } else if (this.cursors.left.isDown) {
            this.player.anims.play("left", true);
            this.player.body.setVelocityX(-300);
            this.currentFacing = this.playerFacing.left;
            const payLoad = {
                method: "movement",
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            // this.ws.send(JSON.stringify(payLoad));
        } else if (this.cursors.up.isDown) {
            this.player.anims.play("up", true);
            this.player.body.setVelocityY(-300);
            this.currentFacing = this.playerFacing.up;
            const payLoad = {
                method: "movement",
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            // this.ws.send(JSON.stringify(payLoad));
        } else if (this.cursors.down.isDown) {
            this.player.anims.play("down", true);
            this.player.body.setVelocityY(300);
            this.currentFacing = this.playerFacing.down;
            const payLoad = {
                method: "movement",
                playerId: this.playerId,
                x: this.player.x,
                y: this.player.y,
                currentFacing: this.currentFacing,
            };
            // this.ws.send(JSON.stringify(payLoad));
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
            console.log(player.playerId);
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
