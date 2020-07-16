Entity = require('./Entity.js');
Utils = require('../../shared/js/Utils.js');

class Turret{
  constructor(x, y, w, h, a){
    this.entity = new Entity(Entity.NEW_ID, "Turret", x, y, w, h, a);
    this.targetAngle = 1;

    this.target = {
      x : 0,
      y : 0
    }

    this.fire = false;
    this.canFire = true;
  }

  fireGun(){
    this.fire = false;
    this.canFire = false;
    return new Event(this.entity.id, this.entity.superType, EventType.TANK_FIRE, {firedAt: new Date().getTime()});
  }

  updateTargetCoordinates(x, y){
    this.target.x = x;
    this.target.y = y;
  }

  updateTargetAngle(){
    this.targetAngle = Utils.getAngle(
      this.entity.x,   //turret x
      (this.entity.y), //turret y
      this.target.x,
      this.target.y);

    if (this.targetAngle < 0){
      this.targetAngle = 360 + this.targetAngle; // range [0, 360]
    }
  }

  updateCurrentAngle(){

      if(Math.abs(this.targetAngle - this.entity.a) > 1){
        if(Utils.isNumberBetween(this.targetAngle - this.entity.a, 0, 180) || Utils.isNumberBetween(this.targetAngle - this.entity.a, -360, -180)){
          this.entity.a += 2;
        }else if(Utils.isNumberBetween(this.targetAngle - this.entity.a, 180, 360) || Utils.isNumberBetween(this.targetAngle - this.entity.a, -180, 0)){
          this.entity.a -= 2;
        }
      }else {
        this.entity.a = this.targetAngle;
      }

    if(this.entity.a > 360){
      this.entity.a = Math.abs(360 - this.entity.a);
    }
    else if(this.entity.a < 0){
      this.entity.a = 360 - Math.abs(this.entity.a);
    }

  }
}

module.exports = Turret;
