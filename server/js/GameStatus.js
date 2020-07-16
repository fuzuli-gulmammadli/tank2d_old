class GameStatus {
  static get PREGAME() {
    return 1;
  }
  static get JOINING() {
    return 2;
  }
  static get STARTED() {
    return 3;
  }
}

module.exports = GameStatus;