(function(module){

  class Vector2d {

    constructor(x, y){
      this.x = x;
      this.y = y;
    }

    add (other) {
      if(other instanceof Vector2d){
        return new Vector2d(this.x + other.x, this.y + other.y);
      }else{
        return null;
      }
    }

    subtract (other) {
      if(other instanceof Vector2d){
        return new Vector2d(this.x - other.x, this.y - other.y);
      }else{
        return null;
      }
    }

    multiply(other) {
      if(other instanceof Vector2d){
        return new Vector2d(this.x * other.x, this.y * other.y);
      }else{
        return null;
      }
    }

    multiplyToNumber(other) {
      if(other instanceof Vector2d){
        return this.x * other.x + this.y * other.y;
      }else{
        return 0;
      }
    }

    multiplyByNumber(num) {
      if(typeof num === 'number'){
        return new Vector2d(this.x * num, this.y * num);
      }else{
        return null;
      }
    }

    squareToNumber () {
      return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    length() {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    getDistanceBetween(other){
      if(other instanceof Vector2d){
        let centerDiff = new Vector2d(other.x - this.x, other.y - this.y);
        return centerDiff.length();
      }else{
        return 0;
      }
    }

    getProjectionOnto(other){
      if(other instanceof Vector2d){
        return other.multiplyByNumber((this.multiplyToNumber(other) / other.squareToNumber()));
      }else{
        return null;
      }
    }
  }

  module.exports = Vector2d;

})(typeof module === 'undefined' ? this.vector2d = {} : module)
