(function(module){

  class Utils {

    static isUndefinedOrNull(v){
      if(typeof(v) === "undefined"){
          return true;
      }else if(v === null){
          return true;
      }else{
          return false;
      }
    }

    static getRectangleCorners(rectangle) {

      const Vector2d = vector2d.exports;

      let v1 = new Vector2d(Math.cos(rectangle.a * (Math.PI / 180)), Math.sin(rectangle.a * (Math.PI / 180)));
      let v2 = new Vector2d(-v1.y, v1.x);

      v1 = v1.multiplyByNumber(rectangle.w / 2);
      v2 = v2.multiplyByNumber(rectangle.h / 2);

      let center = new Vector2d(rectangle.x, rectangle.y);
      return {
        c1 : center.subtract(v1).subtract(v2),
        c2 : center.add(v1).subtract(v2),
        c3 : center.add(v1).add(v2),
        c4 : center.subtract(v1).add(v2)
      }
    }

    static checkCollision (that, other){

      const Vector2d = vector2d.exports;
      let doCollide = false;

      let centerVector = new Vector2d(other.x, other.y).subtract(new Vector2d(that.x, that.y));
      let tdRadius = Utils.getRectangleCorners(that).c1.subtract(new Vector2d(that.x, that.y)).length();
      let odRadius = Utils.getRectangleCorners(other).c1.subtract(new Vector2d(other.x, other.y)).length();

      if(centerVector.length() <= (tdRadius + odRadius)){
        let rectangles = [that, other];
        let rectangleAxises = [other, that];
        let i = 0;
        doCollide = true;

        MAIN: for(const rect of rectangles){

          let axisCorners = Utils.getRectangleCorners(rectangleAxises[i]);
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
            for (const vec of Object.values(Utils.getRectangleCorners(rect))) {
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

      return doCollide;
    }

    static getFireSpriteSelectLocation(x, y){
      let width = 64;
      let height = 128;

      if(x > width * 8){
        x = 0;
        y = 0;
      }
      x += width;

      return {
        x: x,
        y: y,
        w: width,
        h: height
      };
    }

    static getAngleDifference(angle0, angle1){

      var angleDiff = angle1 - angle0;

      if(Math.abs(angleDiff) > 180 && Math.abs(angleDiff) < 360){
        if(angleDiff < 0){
          angleDiff = -((angle1 + (360 - angle0)) * (angleDiff / Math.abs(angleDiff)));
        }else{
          angleDiff = -((angle0 + (360 - angle1)) * (angleDiff / Math.abs(angleDiff)));
        }
      }

      return angleDiff;
    }

    static get NEW_ID() {
      return '_' + Math.random().toString(36).substr(2, 9);
    }

    static getDataMean(data) {
      var mean = null;
      if(data.length > 0){
        var dataSum = 0;
        for(const d of data){
          dataSum += d;
        }
        mean = dataSum / data.length;
      }

      return mean;
    }

    static getDataStandardDeviation(data) {
      var standardDeviation = null;
      if(data.length > 0){
        var mean = Utils.getDataMean(data);
        var dataSum = 0;
        for(const d of data){
          dataSum += Math.pow(d - mean, 2);
        }

        var standardDeviation = Math.sqrt(dataSum / data.length);
      }

      return standardDeviation;
    }

    static drawAim (tx, ty, mx, my, aimRadius, allowedRadius){
      let Vector2d = vector2d.exports;

      var tankVec = new Vector2d(tx, ty);
      var mouseVec = new Vector2d(mx, my);
      var vec = mouseVec.subtract(tankVec);
      var vecLength = vec.length();
      if(vecLength > allowedRadius - aimRadius){
        var ratio = (allowedRadius - aimRadius) / vecLength;
        vec = vec.multiplyByNumber(ratio).add(tankVec);
      }else{
        vec = new Vector2d(mx, my);
      }

      return vec;
    }

    static isNumberBetween (number, start, end){
      if(number > start && number < end){
        return true;
      }else{
        return false
      }
    }

    static isNumberBetweenInclusive (number, start, end){
      if(number >= start && number <= end){
        return true;
      }else{
        return false;
      }
    }

    static getAngle(x0, y0, x1, y1){
      var deltaY = y1 - y0;
      var deltaX = x1 - x0;
      var result = Math.atan2(deltaY, deltaX);
      var result = result * (180 / Math.PI);
      return result;
    }

    static getWidestCornersOfRectangleFromViewPoint(viewPoint, rectangle) {
      const corners = Object.values(Utils.getRectangleCorners(rectangle));
      let angles = [];
      for (const corner of corners) {
        let angle = Utils.getAngle(viewPoint.x, viewPoint.y, corner.x, corner.y);
        if (angle < 0){
          angle += 360; // range [0, 360]
        }

        angles.push(
          {
            angle: angle,
            pos: corner
          });
      }
      angles.sort(function (a, b) {
        if (a.angle > b.angle) {
          return 1;
        }
        if (b.angle > a.angle) {
          return -1;
        }
        return 0;
      });

      return [angles[0], angles[3]];
    }
  }

  module.exports = Utils;

})(typeof module === 'undefined' ? this.utils = {} : module)
