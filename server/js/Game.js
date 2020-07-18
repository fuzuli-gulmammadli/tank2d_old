const BattleTank = require("./BattleTank");
const Wall = require("./Wall");
const GameStatus = require("./GameStatus");

class Game {
    constructor(id, privacy, maxPlayers, players){
        this.id = id;
        this.privacy = privacy;
        this.maxPlayers = maxPlayers;
        this.players = players;
        this.startTime = new Date().getTime();
        this.status = GameStatus.PREGAME;
        this.walls = [new Wall(400, 250, 40, 40, 0)];
        this.battleTanks = [];
        this.missiles = [];
        this.events = [];
        this.updates = [];
    }

    startGame(){
        let x = 100;
        let step = 100;

        for (const player of this.players){
            x += step;
            this.battleTanks.push(new BattleTank(100, x, 60, 40, 1, player.id));
        }
    }
}

module.exports = Game;