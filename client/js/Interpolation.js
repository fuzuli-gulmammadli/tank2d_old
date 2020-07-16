class Interpolation {

  static interpolateMissile(missile0, missile1, startTime, endTime, destructionTime, timeDelta){

    const Vector2d = vector2d.exports;

    const pos0 = new Vector2d(missile0.entity.x, missile0.entity.y);
    const pos1 = new Vector2d(missile1.entity.x, missile1.entity.y);
    const angle0 = missile0.entity.a;
    const angle1 = missile1.entity.a;

    const movementVector = pos1.subtract(pos0);
    const currentTime = (new Date().getTime() - timeDelta) - (endTime - startTime);
    const  timeDiff = (currentTime - startTime) / (endTime - startTime);

    var newPos = movementVector.multiplyByNumber(timeDiff);
    newPos = newPos.add(pos0);

    return {
      x : newPos.x,
      y : newPos.y,
      w : missile0.entity.w,
      h : missile0.entity.h,
      a : missile0.entity.a
    };
  }

  static interpolateTank(tank0, tank1, startTime, endTime, timeDelta){

    const Vector2d = vector2d.exports;
    const Utils = utils.exports;

    const pos0 = new Vector2d(tank0.entity.x, tank0.entity.y);
    const pos1 = new Vector2d(tank1.entity.x, tank1.entity.y);
    const angle0 = tank0.entity.a;
    const angle1 = tank1.entity.a;

    const movementVector = pos1.subtract(pos0);
    const currentTime = (new Date().getTime() - timeDelta) - (endTime - startTime);
    const timeDiff = (currentTime - startTime) / (endTime - startTime);

    let newPos = movementVector.multiplyByNumber(timeDiff);
    let angleDiff = Utils.getAngleDifference(angle0, angle1);
    let newA = angle0 + (angleDiff * timeDiff);
    newPos = newPos.add(pos0);

    const ta0 = tank0.turret.entity.a;
    const ta1 = tank1.turret.entity.a;
    let taDiff = Utils.getAngleDifference(ta0, ta1);
    let newTa = ta0 + (taDiff * timeDiff);

    let newTankPos = {};
    newTankPos.tank = {
      x : newPos.x,
      y : newPos.y,
      w : tank0.entity.w,
      h : tank0.entity.h,
      a : newA
    };
    newTankPos.turret = {
      x : newPos.x,
      y : newPos.y,
      w : tank0.turret.entity.w,
      h : tank0.turret.entity.h,
      a : newTa
    };

    return newTankPos;
  }
}
