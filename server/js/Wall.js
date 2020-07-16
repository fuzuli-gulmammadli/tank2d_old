Entity = require('./Entity.js');

class Wall {

  constructor(x, y, w, h, a) {
    this.entity = new Entity(Entity.NEW_ID, "Wall", x, y, w, h, a);
  };
}

module.exports = Wall;
