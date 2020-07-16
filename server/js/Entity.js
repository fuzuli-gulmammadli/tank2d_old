Event = require('./Event.js');
EventType = require('./EventType.js');
//shared classes
Vector2d = require('../../shared/js/Vector2d.js');

class Entity{
  constructor(id, superType, x, y, w, h, a){
    this.id = id;
    this.superType = superType;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a = a;

    this.v = 0;
    this.av = 0;
    this.state = 1;

    this.c1 = new Vector2d(0, 0);
    this.c2 = new Vector2d(0, 0);
    this.c3 = new Vector2d(0, 0);
    this.c4 = new Vector2d(0, 0);
  }

  static get NEW_ID() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  getCorners(){
    let v1 = new Vector2d(Math.cos(this.a * (Math.PI / 180)), Math.sin(this.a * (Math.PI / 180)));
    let v2 = new Vector2d(-v1.y, v1.x);

    v1 = v1.multiplyByNumber(this.w / 2);
    v2 = v2.multiplyByNumber(this.h / 2);

    let center = new Vector2d(this.x, this.y);
    return {
      c1 : center.subtract(v1).subtract(v2),
      c2 : center.add(v1).subtract(v2),
      c3 : center.add(v1).add(v2),
      c4 : center.subtract(v1).add(v2)
    }
  }

  updateCorners(){
    let corners = this.getCorners();
    this.c1 = corners.c1;
    this.c2 = corners.c2;
    this.c3 = corners.c3;
    this.c4 = corners.c4;
  }

  checkCollision (other){

    let doCollide = false;
    if(other instanceof Entity) {

      let centerVector = new Vector2d(other.x, other.y).subtract(new Vector2d(this.x, this.y));
      let tdRadius = this.getCorners().c1.subtract(new Vector2d(this.x, this.y)).length();
      let odRadius = other.getCorners().c1.subtract(new Vector2d(other.x, other.y)).length();

      if(centerVector.length() <= (tdRadius + odRadius)){
        let rectangles = [this, other];
        let rectangleAxises = [other, this];
        let i = 0;
        doCollide = true;

        MAIN: for(const rect of rectangles){

          let axisCorners = rectangleAxises[i].getCorners();
          let axises = [];
          axises.push(axisCorners.c2.subtract(axisCorners.c1));
          axises.push(axisCorners.c3.subtract(axisCorners.c2));

          for(const axis of axises){

            let centerProjection = centerVector.getProjectionOnto(axis);
            let distanceBetweenCenters = centerProjection.length();
            // console.log("distanceBetweenCenters: " + distanceBetweenCenters);

            let longest = 0;
            let projectionVector = {};
            //find longest corner projection vector
            for (const vec of Object.values(rect.getCorners())) {
              let cv = vec.subtract(new Vector2d(rect.x, rect.y));
              let projection = cv.getProjectionOnto(axis);
              if(projection.length() > longest){
                longest = projection.length();
                projectionVector = projection;
              }
            }

            if((projectionVector.length() + (axis.length() / 2)) < distanceBetweenCenters){
              doCollide = false;
              break MAIN;
            }
          }

          i++;
        }
      }
    }

    if(doCollide){
      return new Event(this.id, this.superType, EventType.COLLISION, {collidedWith: other.superType, entityId: other.id});
    }else{
      return null;
    }
  }
}

module.exports = Entity;
