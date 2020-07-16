const express = require("express");
const app = express();
app.set("view engine", "ejs");
var bodyParser = require('body-parser');
const server = require("http").Server(app);
const path = require('path');

//server classes
const Wall = require("./server/js/Wall");
const BattleTank = require("./server/js/BattleTank");
const Player = require("./server/js/Player");
const Game = require("./server/js/Game");
const Missile = require("./server/js/Missile");
const Entity = require("./server/js/Entity");
const Event = require("./server/js/Event");
const EventType = require("./server/js/EventType");
const GameStatus = require("./server/js/GameStatus");

//shared classes
Vector2d = require("./shared/js/Vector2d.js");
Utils = require("./shared/js/Utils.js");

server.listen(2000);
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function(req, res){
  res.sendFile(__dirname + "/client/login.html");
});

// app.get("/game", function(req, res){
//   res.sendFile(__dirname + "/client/game.html");
// });

app.post("/menu", function(req, res){
  var playerName = req.body.playerName;
  var player = new Player(Entity.NEW_ID, playerName, null);
  players[player.id] = player;

  res.render("menu", {playerId: player.id, playerName: player.name});
});

app.post("/gameCreator", function(req, res){
  res.render("gameCreator", {playerId: req.body.playerId});
});

app.post("/lobby", function(req, res){
  res.render("lobby", {playerId: req.body.playerId});
});

app.post("/preGame", function(req, res){
  let gameId = req.body.gameId;
  let privacy = req.body.privacy;
  let maxPlayers = req.body.maxPlayers;
  let playerId = req.body.playerId;
  
  const player = players[playerId];

  let playerList = "";
  let newGame = {};
  if (typeof gameId === 'undefined'){
    const game = new Game(Entity.NEW_ID, privacy, maxPlayers, [player]);
    newGame = game;
    games[game.id] = game;
    playerList = "<li>" + player.name + "</li>"
  }else{
    const game = games[gameId];
    newGame = game;
    if(game !== null && players !== null && game.players.length < game.maxPlayers){
      game.players.push(player);
    }

    for(i in game.players){
      const p = game.players[i];
      playerList += "<li>" + p.name + "</li>"
    }
  }
  
  res.render("preGame", {gameId: newGame.id, playerId: req.body.playerId, playerList: playerList});
});

app.post("/game", function(req, res){
  
  const gameId = req.body.gameId;
  const game = games[gameId];
  if(game.status === GameStatus.JOINING){
    game.startGame();
  }

  res.render("game", {gameId: game.id, playerId: req.body.playerId});
});

app.use("/client", express.static("./client"));
app.use("/shared", express.static("./shared"));

let sockets = {};
let canvasWidth = 1000;
let canvasHeight = 500;

const io = require("socket.io")(server, {});

io.on("connection", function(socket){

  socket.on("inLobby", function(data){
    socket.playerId = data.playerId;
    socket.gameLocation = "lobby";
    var player = players[data.playerId];
    player.socket = socket;
  });

  socket.on("inPreGame", function(data){
    socket.gameId = data.gameId;
    socket.playerId = data.playerId;
    socket.gameLocation = "preGame";
    socket.join(data.gameId);
    var player = players[data.playerId];
    player.socket = socket;
  });

  socket.on("inGame", function(data){
    socket.gameId = data.gameId;
    socket.playerId = data.playerId;
    socket.gameLocation = "game";
    socket.join(data.gameId);
    var player = players[data.playerId];
    player.socket = socket;
  });

  socket.on("disconnect", function(data){
    const gameLocation = socket.gameLocation;
    if(gameLocation === "lobby"){
    }else if(gameLocation === "preGame"){
      const gameId = socket.gameId;
      const playerId = socket.playerId;
      let game = games[gameId];
      let player = players[playerId];
      if(!Utils.isUndefinedOrNull(game) && !Utils.isUndefinedOrNull(player)){
        if(game.status === GameStatus.PREGAME){
          game.players = game.players.filter(p => p.id !== playerId);

          if(game.players.length <= 0){
            delete games[game.id];
          }
        }
      }
    }
    socket.gameLocation = "out";
  });

  socket.on("clientLatencyCheck", function (data) {
    var timeInfo = data.timeInfo;
    timeInfo.serverTime = new Date().getTime();
    socket.emit("serverLatencyCheck", { timeInfo });
  });

  socket.on("movement", function (data) {
    const game = games[socket.gameId];
    if (!Utils.isUndefinedOrNull(game) && game.status === GameStatus.STARTED) {
      let battleTank = game.battleTanks.find(bt => bt.playerId === socket.playerId);
      var direction = battleTank.direction;

      if (data.direction === "right") {
        direction.right = data.state;
      }
      if (data.direction === "left") {
        direction.left = data.state;
      }
      if (data.direction === "forward") {
        direction.forward = data.state;
      }
      if (data.direction === "back") {
        direction.back = data.state;
      }

      battleTank.direction = direction;
    }
  });

  socket.on("mouseMovement", function (data) {
    const game = games[socket.gameId];
    if (!Utils.isUndefinedOrNull(game) && game.status === GameStatus.STARTED) {
      let battleTank = game.battleTanks.find(bt => bt.playerId === socket.playerId);
      battleTank.turret.updateTargetCoordinates(data.x, data.y);
    }
  });

  socket.on("fire", function (data) {
    const game = games[socket.gameId];
    if (!Utils.isUndefinedOrNull(game) && game.status === GameStatus.STARTED) {
      let battleTank = game.battleTanks.find(bt => bt.playerId === socket.playerId);
      if (battleTank.turret.canFire) {
        battleTank.turret.fire = true;
      }
    }
  });
});

var players = {};
var games = {};

setInterval(function () {
  for (g in games) {
    const game = games[g];
    if (game.status === GameStatus.STARTED) {
      var battleTanks = game.battleTanks;
      var missiles = game.missiles;
      var walls = game.walls;
      var events = game.events;

      var prevBattleTanks = [];
      var battleTankEntities = [];
      for (const battleTank of battleTanks) {

        //save current entities
        var prevBattleTank = JSON.parse(JSON.stringify(battleTank));
        prevBattleTanks.push(prevBattleTank);

        if (battleTank.health > 0) {
          //update locations
          battleTank.updateLocation();

          //update turret
          battleTank.turret.updateTargetAngle();
          battleTank.turret.updateCurrentAngle();

          let turret = battleTank.turret;
          if (turret.fire === true && turret.canFire === true && battleTank.ammunition > 0) {
            missiles.push(new Missile(battleTank.entity.id, turret.entity.x, turret.entity.y, 8, 8, turret.entity.a));
            battleTank.ammunition -= 1;
            let event = turret.fireGun();
            if (event !== null) {
              events.push(event);
            }
          }
        }

        var vec0 = new Vector2d(battleTank.entity.x, battleTank.entity.y);
        var vec1 = new Vector2d(prevBattleTank.entity.x, prevBattleTank.entity.y);
        var vec = vec1.subtract(vec0);
        var volumeCenter = vec.multiplyByNumber(0.5).add(vec0);
        var entityVolume = new Entity(battleTank.entity.id,
          "BattleTank",
          volumeCenter.x,
          volumeCenter.y,
          vec.length() + battleTank.entity.w,
          battleTank.entity.h,
          battleTank.entity.a);

        battleTankEntities.push(entityVolume);
      }

      //missile updates
      var prevMissiles = [];
      var missileEntities = [];
      for (const missile of missiles) {
        var prevMissile = JSON.parse(JSON.stringify(missile));
        prevMissiles.push(prevMissile);

        //update location
        missile.updateLocation();

        if (!missile.isDestroyed) {
          var vec0 = new Vector2d(missile.entity.x, missile.entity.y);
          var vec1 = new Vector2d(prevMissile.entity.x, prevMissile.entity.y);
          var vec = vec1.subtract(vec0);
          var volumeCenter = vec.multiplyByNumber(0.5).add(vec0);
          var entityVolume = new Entity(missile.entity.id,
            "Missile",
            volumeCenter.x,
            volumeCenter.y,
            vec.length() + missile.entity.w,
            missile.entity.h,
            missile.entity.a);

          missileEntities.push(entityVolume);
        }
      }

      //<<<<< COLLISION DETECTION STARTS HERE >>>>>
      var potentialCollisions = [];

      //test for potential missile collisions
      for (const missileEntity of missileEntities) {
        for (const battleTankEntity of battleTankEntities) {
          var event = missileEntity.checkCollision(battleTankEntity);
          if (event) {
            potentialCollisions.push(event);
          }
        }

        for (const wall of walls) {
          var event = missileEntity.checkCollision(wall.entity);
          if (event) {
            potentialCollisions.push(event);
          }
        }
      }

      //test for potential tank collisions
      for (const battleTankEntity of battleTankEntities) {
        for (const wall of walls) {
          var event = battleTankEntity.checkCollision(wall.entity);
          if (event) {
            potentialCollisions.push(event);
          }
        }
      }

      for (const potentialCollision of potentialCollisions) {

        var col0vec0 = null;
        var col0vec1 = null;
        var col0angle0 = null;
        var col0angle1 = null;
        var col0entity = null;

        var col1vec0 = null;
        var col1vec1 = null;
        var col1angle0 = null;
        var col1angle1 = null;
        var col1entity = null;

        var angleVelocity = 0;
        if (potentialCollision.entityType === 'Missile') {
          var prevMissile = prevMissiles.filter(m => m.entity.id === potentialCollision.entityId)[0];
          var missile = missiles.filter(m => m.entity.id === potentialCollision.entityId)[0];

          col0vec0 = new Vector2d(prevMissile.entity.x, prevMissile.entity.y);
          col0vec1 = new Vector2d(missile.entity.x, missile.entity.y);
          col0angle0 = prevMissile.entity.a;
          col0angle1 = missile.entity.a;
          col0entity = missile.entity;

          if (potentialCollision.info.collidedWith === 'BattleTank') {
            var prevBattleTank = prevBattleTanks.filter(bt => bt.entity.id === potentialCollision.info.entityId)[0];
            var battleTank = battleTanks.filter(bt => bt.entity.id === potentialCollision.info.entityId)[0];

            col1vec0 = new Vector2d(prevBattleTank.entity.x, prevBattleTank.entity.y);
            col1vec1 = new Vector2d(battleTank.entity.x, battleTank.entity.y);
            col1angle0 = prevBattleTank.entity.a;
            col1angle1 = battleTank.entity.a;
            col1entity = battleTank.entity;

            if (missile.battleTankId === battleTank.entity.id) {
              continue;
            }

          } else if (potentialCollision.info.collidedWith === 'Wall') {
            var wall = walls.filter(w => w.entity.id === potentialCollision.info.entityId)[0];

            col1vec0 = new Vector2d(wall.entity.x, wall.entity.y);
            col1vec1 = new Vector2d(wall.entity.x, wall.entity.y);
            col1angle0 = wall.entity.a;
            col1angle1 = wall.entity.a;
            col1entity = wall.entity;
          }
        } else if (potentialCollision.entityType === 'BattleTank') {
          var prevBattleTank = prevBattleTanks.filter(bt => bt.entity.id === potentialCollision.entityId)[0];
          var battleTank = battleTanks.filter(bt => bt.entity.id === potentialCollision.entityId)[0];

          col0vec0 = new Vector2d(prevBattleTank.entity.x, prevBattleTank.entity.y);
          col0vec1 = new Vector2d(battleTank.entity.x, battleTank.entity.y);
          col0angle0 = prevBattleTank.entity.a;
          col0angle1 = battleTank.entity.a;
          col0entity = battleTank.entity;
          angleVelocity = battleTank.entity.av;

          if (potentialCollision.info.collidedWith === 'BattleTank') {

          } else if (potentialCollision.info.collidedWith === 'Wall') {
            var wall = walls.filter(w => w.entity.id === potentialCollision.info.entityId)[0];

            col1vec0 = new Vector2d(wall.entity.x, wall.entity.y);
            col1vec1 = new Vector2d(wall.entity.x, wall.entity.y);
            col1angle0 = wall.entity.a;
            col1angle1 = wall.entity.a;
            col1entity = wall.entity;
          }
        }

        var vec0 = col0vec1.subtract(col0vec0);
        var vec1 = col1vec1.subtract(col1vec0);
        var angleDiff0 = Utils.getAngleDifference(col0angle0, col0angle1);
        var angleDiff1 = Utils.getAngleDifference(col1angle0, col1angle1);
        var vel0 = vec0.length();
        var vel1 = vec1.length();
        var velocity = vel0;
        if (vel1 > vel0) {
          velocity = vel1;
        }
        if (velocity === 0) {
          velocity = Math.abs(angleVelocity);
        }
        velocity += 1;

        for (var iter = 0; iter < velocity; iter++) {
          var vec0pos = vec0.multiplyByNumber(iter / velocity).add(col0vec0);
          var vec1pos = vec1.multiplyByNumber(iter / velocity).add(col1vec0);
          angle0pos = col0angle0 + angleDiff0 * (iter / velocity);
          angle1pos = col1angle0 + angleDiff1 * (iter / velocity);

          var entityHistory0 = new Entity(col0entity.id,
            col0entity.superType,
            vec0pos.x,
            vec0pos.y,
            col0entity.w,
            col0entity.h,
            col0entity.a);

          var entityHistory1 = new Entity(col1entity.id,
            col1entity.superType,
            vec1pos.x,
            vec1pos.y,
            col1entity.w,
            col1entity.h,
            col1entity.a);

          var event = entityHistory0.checkCollision(entityHistory1);
          if (event && iter < 2) {
            if (event.entityType === "BattleTank") {
              if (event.info.collidedWith === "Wall") {
                var pos0 = vec0.multiplyByNumber((iter - 1) / velocity).add(col0vec0);
                var angle0 = col0angle0 + ((angleDiff0 * (iter - 1) / velocity));
                event.info.posBeforeCollision = pos0;
                event.info.angleBeforeCollision = angle0;
              }
            }
            events.push(event);
            break;
          } else if (event) {
            var pos0 = vec0.multiplyByNumber((iter - 1) / velocity).add(col0vec0);
            var pos1 = vec1.multiplyByNumber((iter - 1) / velocity).add(col1vec0);
            col0entity.x = pos0.x;
            col0entity.y = pos0.y;
            col1entity.x = pos1.x;
            col1entity.y = pos1.y;
            break;
          }
        }
      }
      //<<<<< COLLISION DETECTION ENDS HERE >>>>>

      for (const missile of missiles) {
        if (missile.isDestroyed === false) {
          if (missile.entity.x > canvasWidth || missile.entity.x < 0 || missile.entity.y > canvasHeight || missile.entity.y < 0) {
            events.push(new Event(missile.entity.id, "Missile", EventType.OUT_OF_SCREEN, null));
          }
        }
      }

      var gameUpdate = {walls, battleTanks, missiles};

      //handle events
      for (const event of events) {
        gameUpdate = Event.handleEvent(event, gameUpdate);
      }
      //delete handled events
      events = events.filter(event => event.handleStatus === 0);

      //update game
      game.walls = gameUpdate.walls;
      game.battleTanks = gameUpdate.battleTanks;
      game.missiles = gameUpdate.missiles;
      game.events = events;
    }
  }
}, 1000 / 50);

//game
setInterval(function () {
  for (g in games) {
    const game = games[g]; 
    if (game.status === GameStatus.STARTED) {
      var gameUpdates = game.updates;

      var update = JSON.parse(JSON.stringify({walls: game.walls, battleTanks: game.battleTanks, missiles: game.missiles}));
      game.updates.push({gus: update, timeSent: new Date().getTime()});
      if(game.updates.length > 2){
        game.updates.splice(0, 1);
      }

      if (game.updates.length >= 2) {

        update = gameUpdates[gameUpdates.length - 1];      
        update.gus.missiles.map(m => {
            if (m.isDestroyed) {
              m.isSentAfterDestruction = true;
            }
          }
        );

        io.to(game.id).emit("gameUpdate", { gameUpdates: game.updates });
      }
    }
  }
}, 1000 / 10);

//menu
setInterval(function(){
  if(Object.keys(games).length > 0 && Object.keys(players).length > 0){
    let gameList = [];
    for(gameId in games){
      const game = games[gameId];
      gameList.push({
        id: game.id,
        players: (game.players.length + "/" + game.maxPlayers)
      });
    }
    for(i in players){
      var socket = players[i].socket;
      if(socket !== null && socket.gameLocation === 'lobby'){
        socket.emit("gameList", {gameList});
      }
    }

    for(i in games){
      const game = games[i];
      if (!Utils.isUndefinedOrNull(game) && game.status === GameStatus.PREGAME) {
        const gamePlayers = game.players;
        let playerList = [];
        for (j in gamePlayers) {
          const player = gamePlayers[j];

          let socket = player.socket;
          if (!Utils.isUndefinedOrNull(socket) && socket.gameLocation === 'preGame') {
            playerList.push({ id: player.id, name: player.name });
          }
        }

        let canStart = false;
        const gameStartTime = game.startTime;
        const currentTime = new Date().getTime();
        const secondsPassedFromStart = (currentTime - gameStartTime) / 1000;
        if (secondsPassedFromStart > 3) {
          canStart = true;
          game.status = GameStatus.JOINING;
        }
        io.to(game.id).emit("playerList", { playerList, canStart });
      }
    }
  }else{
    for(i in players){
      var socket = players[i].socket;
      if(!Utils.isUndefinedOrNull(socket) && socket.gameLocation === 'lobby'){
        socket.emit("gameList", {});
      }
    }
  }
}, 1000);
