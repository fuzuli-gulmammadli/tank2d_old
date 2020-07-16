Entity = require('./Entity.js');
Turret = require('./Turret.js');
Event = require('./Event.js');
EventType = require('./EventType.js');

class BattleTank{
  constructor(x, y, w, h, a, playerId) {
    this.entity = new Entity(Entity.NEW_ID, "BattleTank", x, y, w, h, a);

    this.playerId = playerId;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.ammunition = 30;

    this.maxSpeed = 3;
    this.maxAngleSpeed = 1;

    this.accelaration = 0.1;
    this.angleAccelaration = 1;

    this.direction = {
          left:false,
          right:false,
          forward:false,
          back:false
    };

    this.turret = new Turret(x, y, w, 10, 60);
  }

  updateLocation(){

    if(this.direction.forward){
      this.entity.v += this.accelaration;
    }
    if(this.direction.back){
      this.entity.v -= this.accelaration;
    }
    if(this.direction.right){
      this.entity.av += this.angleAccelaration;
      // this.entity.a += 1;
    }
    if(this.direction.left){
      this.entity.av -= this.angleAccelaration;
      // this.entity.a -= 1;
    }

    if(!this.direction.forward && !this.direction.back){
      var tempV = Math.abs(this.entity.v);
      if (tempV > 0){
        var newV = tempV - (this.accelaration/4);
        if(newV < 0){
          newV = 0;
        }
        this.entity.v = newV * (tempV / this.entity.v);
      }
    }
    if(this.direction.left || this.direction.right){
      var tempV = Math.abs(this.entity.v);
      if (tempV > 0){
        var newV = tempV - (this.accelaration * 2);
        if(newV < 0){
          newV = 0;
        }
        this.entity.v = newV * (tempV / this.entity.v);
      }
    }
    if(!this.direction.left && !this.direction.right){
      var tempV = Math.abs(this.entity.av);
      if (tempV > 0){
        var newV = tempV - (this.angleAccelaration * 2);
        if(newV < 0){
          newV = 0;
        }
        this.entity.av = newV * (tempV / this.entity.av);
      }
    }

    if(Math.abs(this.entity.v) > this.maxSpeed){
      this.entity.v = (this.entity.v / Math.abs(this.entity.v)) * this.maxSpeed;
    }
    if(Math.abs(this.entity.av) > this.maxAngleSpeed){
      this.entity.av = (this.entity.av / Math.abs(this.entity.av)) * this.maxAngleSpeed;
    }

    this.entity.a += this.entity.av;

    if(this.entity.a > 360){
      this.entity.a = 1;
    }else if(this.entity.a < 0){
      this.entity.a = 359;
    }

    var x = Math.cos(this.entity.a * (Math.PI / 180)) * this.entity.v;
    var y = Math.sin(this.entity.a * (Math.PI / 180)) * this.entity.v;

    this.entity.x += x;
    this.entity.y += y;
    this.turret.entity.x = this.entity.x;
    this.turret.entity.y = this.entity.y;
  }
}

module.exports = BattleTank;
