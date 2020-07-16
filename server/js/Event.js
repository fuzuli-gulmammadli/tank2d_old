Entity = require('./Entity.js');
EventType = require('./EventType.js');

class Event {
  constructor(entityId, entityType, type, info){
    this.entityId = entityId;
    this.entityType = entityType;
    this.type = type;
    this.info = info;

    this.handleStatus = 0;
  }

  static handleEvent(event, gameUpdate){
    if(event.type === EventType.OUT_OF_SCREEN){
      if(event.entityType === "Missile"){
        var missile = gameUpdate.missiles.find(missile => missile.entity.id === event.entityId);

        missile.isDestroyed = true;
        if(missile.isDestroyed && missile.isSentAfterDestruction){
          gameUpdate.missiles = gameUpdate.missiles.filter(missile => missile.entity.id !== event.entityId);
          event.handleStatus = 1;
        }
      }
    }else if(event.type === EventType.COLLISION){
      if(event.entityType === "Missile"){

        var missile = gameUpdate.missiles.find(missile => missile.entity.id === event.entityId);
        if(event.info.collidedWith === "Wall"){

        }else if(event.info.collidedWith === "BattleTank"){
          if(missile.isDestroyed === false){
            var battleTank = gameUpdate.battleTanks.find(bt => bt.entity.id === event.info.entityId);
            battleTank.health -= 25;
          }
        }

        missile.isDestroyed = true;
        if(missile.isDestroyed && missile.isSentAfterDestruction){
          gameUpdate.missiles = gameUpdate.missiles.filter(missile => missile.entity.id !== event.entityId);
          event.handleStatus = 1;
        }
      }else if(event.entityType === "BattleTank"){
        if(event.info.collidedWith === "Wall"){
          var battleTank = gameUpdate.battleTanks.filter(bt => bt.entity.id === event.entityId)[0];
          battleTank.entity.x = event.info.posBeforeCollision.x;
          battleTank.entity.y = event.info.posBeforeCollision.y;
          battleTank.entity.a = event.info.angleBeforeCollision;
          battleTank.entity.v = 0;
          battleTank.entity.av = 0;
          event.handleStatus = 1;
        }
      }
    }else if(event.type === EventType.TANK_FIRE){
      if(event.entityType === "Turret"){
        if(new Date().getTime() - event.info.firedAt > 1000){
          var battleTank = gameUpdate.battleTanks.filter(bt => bt.turret.entity.id === event.entityId)[0];
          battleTank.turret.canFire = true;
          event.handleStatus = 1;
        }
      }
    }

    return gameUpdate;
  }
}

module.exports = Event;
