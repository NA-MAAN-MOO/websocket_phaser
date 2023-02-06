class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene_1");
    }

    init() {}

    preload() {
        // load
        this.load.image("bg", "assets/background.png");
        this.load.spritesheet("character", "assets/character.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        // create
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.add.sprite(200, 200, "character");
        // This line creates a new Websocket variable,
        // this.ws specifies the name of the variable,
        // and will be a class variable with the this keyword.
        // Localhost:9090 is just a random port,
        // it does not have to be 9090, could be port 3000, 5000, or any port you want.
        this.ws = new WebSocket("ws://localhost:9090");
    }

    update() {}
}
