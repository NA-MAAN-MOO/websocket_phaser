const express = require("express"); // Load in express module
const app = express();
const http = require("http"); // Load in http module
const dotenv = require("dotenv");
const redis = require("redis");
const httpServer = http.createServer(app);

const { Server } = require("socket.io"); // Load in socket.io
const io = new Server(httpServer); // initialize socket instance (passing httpserver)

// redis 설정하기
dotenv.config(); // env환경변수 파일 가져오기
//* Redis 연결
// redis[s]://[[username][:password]@][host][:port][/db-number]
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true, // 반드시 설정 !!
});
redisClient.on("connect", () => {
    console.info("Redis connected!");
});
redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});
redisClient.connect().then(); // redis v4 연결 (비동기)
// 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용
const redisCli = redisClient.v4;

// localhost:5500 is where the game page will be served
// It will create a socket connect to 9090
app.use("/js", express.static(__dirname + "/js"));
app.use("/assets", express.static(__dirname + "/assets"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// app.listen(5500, () => console.log("Client Port, listening.. on 5500"));
// The server will be on port 9090
// const websocketServer = require("websocket").server;

// socket.io 작업중-공사중입니다.
io.on("connection", (socket) => {
    // socket이 연결됩니다~ 이 안에서 서버는 연결된 클라이언트와 소통할 준비가 됨
    console.log("a user connected");
    socket.on("disconnect", () => {
        // socket이 연결 해제됩니다~
        console.log("user disconnected!!!");
    });
    const playerId = gpId();
    const x = randomX();
    const y = randomY();
    let playerInfo = {
        socket: socket,
        playerId: playerId,
        x: x,
        y: y,
    };
    // The payload to be sent back to the client
    const payLoad = {
        playerId: playerId,
        x: x,
        y: y,
    };
    // Send back the payload to the client and set its initial position
    socket.emit("start", payLoad);
    // Send back the payload to the client and set its initial position
    players.forEach((player) => {
        const payLoad = {
            playerId: playerId,
            x: x,
            y: y,
        };
        player.socket.emit("newPlayer", payLoad);
    });

    players.push(playerInfo);
});

// httpServer.listen(9090, () => console.log("Server Port, listening.. on 9090"));
httpServer.listen(3000);

// Store a list of all the players
let players = [];

// const wsServer = new websocketServer({
//     httpServer: httpServer,
// });
// wsServer.on("request", (request) => {
//     // A connection
//     const connection = request.accept(null, request.origin);

//     connection.on("close", () => {
//         players.forEach((player) => {
//             if (player.playerId !== playerId) {
//                 const payLoad = {
//                     method: "disconnect",
//                     playerId: playerId,
//                 };
//                 player.connection.send(JSON.stringify(payLoad));
//             }
//         });
//         players = players.filter((player) => player.playerId !== playerId);
//     });

//     connection.on("message", (message) => {
//         const result = JSON.parse(message.utf8Data);

//         if (result.method === "currentPlayers") {
//             players.forEach((player) => {
//                 if (player.playerId !== playerId) {
//                     const payLoad = {
//                         method: "currentPlayers",
//                         playerId: player.playerId,
//                         x: player.x,
//                         y: player.y,
//                     };
//                     connection.send(JSON.stringify(payLoad));
//                 }
//             });
//         }

//         if (result.method === "movement") {
//             const playerId = result.playerId;
//             const x = result.x;
//             const y = result.y;
//             const payLoad = {
//                 currentFacing: result.currentFacing,
//                 method: "updateLocation",
//                 playerId: playerId,
//                 x: x,
//                 y: y,
//             };
//             players.forEach((player) => {
//                 if (player.playerId !== result.playerId) {
//                     player.connection.send(JSON.stringify(payLoad));
//                 } else {
//                     player.x = x;
//                     player.y = y;
//                 }
//             });
//         }
//     });

// const playerId = gpId();
// const x = randomX();
// const y = randomY();
// let playerInfo = {
//     connection: connection,
//     playerId: playerId,
//     x: x,
//     y: y,
// };

// // The payload to be sent back to the client
// const payLoad = {
//     method: "connect",
//     playerId: playerId,
//     x: x,
//     y: y,
// };
// // Send back the payload to the client and set its initial position
// connection.send(JSON.stringify(payLoad));

// // Send back the payload to the client and set its initial position
// players.forEach((player) => {
//     const payLoad = {
//         method: "newPlayer",
//         playerId: playerId,
//         x: x,
//         y: y,
//     };
//     player.connection.send(JSON.stringify(payLoad));
// });

// players.push(playerInfo);
// });

// 서버에 들어오는 유저에게 id 값좌 좌표값 할당
function gpId() {
    return (
        Math.floor(Math.random() + 100) * Math.floor(Math.random() * 100) +
        Math.floor(Math.random() * 100)
    );
}
function randomX() {
    return Math.floor(Math.random() * 700) + 35;
}
function randomY() {
    return Math.floor(Math.random() * 300) + 50;
}
