class EventType {
  static get OUT_OF_SCREEN() {
    return 1;
  }
  static get COLLISION() {
    return 2;
  }
  static get TANK_FIRE() {
    return 3;
  }
}

module.exports = EventType;
