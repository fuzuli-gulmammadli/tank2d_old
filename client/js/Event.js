document.onkeydown = function(event){

  if(event.keyCode === 68){
    socket.emit("movement", {direction: "right", state: true});
  }else if(event.keyCode === 83){
    socket.emit("movement", {direction: "back", state: true});
  }else if(event.keyCode === 65){
    socket.emit("movement", {direction: "left", state: true});
  }else if(event.keyCode === 87){
    socket.emit("movement", {direction: "forward", state: true});
  }else if(event.keyCode === 32){
    socket.emit("fire", {mode: "single"});
  }
};

document.onkeyup = function(event){

  if(event.keyCode === 68){
    socket.emit("movement", {direction: "right", state: false});
  }else if(event.keyCode === 83){
    socket.emit("movement", {direction: "back", state: false});
  }else if(event.keyCode === 65){
    socket.emit("movement", {direction: "left", state: false});
  }else if(event.keyCode === 87){
    socket.emit("movement", {direction: "forward", state: false});
  }
};

document.onmousemove = function(event){
  socket.emit("mouseMovement", {
    x: event.clientX, y: event.clientY
  });

  mouseX = event.clientX;
  mouseY = event.clientY;
};
