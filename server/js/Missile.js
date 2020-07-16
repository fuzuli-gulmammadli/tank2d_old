Entity = require('./Entity.js');
Event = require('./Event.js');

class Missile {

  constructor(battleTankId, x, y, w, h, a) {
    this.battleTankId = battleTankId;
    this.isDestroyed = false;
    this.isSentAfterDestruction = false;
    this.entity = new Entity(Entity.NEW_ID, "Missile", x, y, w, h, a);
  };

  updateLocation(){
    this.entity.v = 26;

    var x = Math.cos(this.entity.a * (Math.PI / 180)) * this.entity.v;
    var y = Math.sin(this.entity.a * (Math.PI / 180)) * this.entity.v;

    this.entity.x += x;
    this.entity.y += y;
  }
}

module.exports = Missile;
