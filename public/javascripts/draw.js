
tool.maxDistance = 50;
/**
  * Return URL parameter By Name value
  * @param {string} name - name of the parameter we want to read the value for
  * @returns {string}
  **/
function getURLParameter(name) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,''])[1]
  );
}

$(function() {
  readAndAddImageToBackground();
  
  $('.clear-btn').click(function() {clearCanvas();});
  $('.undo-btn').click(function() {undoWork();});
});


function readAndAddImageToBackground() {
  var canvasPaper = document.getElementById("draw"),
      ctxPaper = canvasPaper.getContext("2d");

  var img = new Image();
  img.src = getURLParameter('path');
  img.id = 'background';
  
  img.onload = function() {
    view.viewSize = new Size(img.width, img.height);
    var ratio = 1;
    
   canvasPaper.width = img.width;
   canvasPaper.height = img.height;
    // Draw original image in second canvas
    var raster = new Raster({
        source: img.src,
        position: view.center
    });
    raster.scale(ratio);
    raster.position.x = img.width*ratio/2;
    raster.position.y = img.height*ratio/2;
    project.layers[0].addChild(raster);
  }
}

function onMouseDown(event) {
  segment = path = null;
  switch (drawMode) {
    case 'line':
      path = new Path();
      path.strokeColor = color;
      path.strokeWidth = pencilSize;
    break;
    case 'circle':
      path = null;
      return;
    break;
    case 'rectangle':
      path = null;
    break;
    case 'erase':
      if (!path) {
        var hitResult = project.hitTest(event.point, hitOptions);
        if (hitResult) {
          path = hitResult.item;
          path.selected = true;
        }
      }
    break;
    case 'text':
      path = null;
      return;
    break;
  }
}

function onMouseUp(event) {
  var auxPath;
  switch (drawMode) {
    case 'line':
      path.add(event.point);
    break;
    case 'circle':
      var radius = event.delta.length / 2;
      if (radius == 0) {
        radius = 10;
      }
      path = new Path.Circle(event.middlePoint, radius);
      path.strokeColor = color;
      path.strokeWidth = pencilSize;
    break;
    case 'rectangle':
      var delta = event.delta.length;
      if (delta == 0) {
        delta = 10;
      }
      path = new Path.Rectangle({
        from: event.middlePoint,
        to: (event.middlePoint + delta)
      });
      path.strokeColor = color;
      path.strokeWidth = pencilSize;
    break;
    case "erase":
      if (path != null && path.type == "path") {  
        auxPath = path;   
        path.removeSegments();
        path = null;
      }
    break;
    case 'text':
      if (text) {
        var canvasText = new PointText({
          point: event.point,
          content: text,
          justification: 'center',
          fontSize: 15,
          fillColor: color
        });
        resetInputText();
        path = canvasText;
      }
    break;
  }
  if (drawMode != "erase") {
      var children = project.activeLayer.children;

      if(typeof(children[children.length - 2].name) != 'undefined' ) {
        var lastChild = children[children.length - 2];
        var name = lastChild.name.toString();
        pathName = parseInt(name.replace(/_/, '')) + 1;
      } else {
        pathName ++;
      }

      pathName = '_' + pathName.toString();
      path.name = pathName;
  }

  var x = event.middlePoint.x;
  var y = event.middlePoint.y;
  var auxName = pathName;
 
  if(drawMode == "erase" && auxPath != null) {
    auxName = auxPath.name;
  }

  emitPath(x, y, path, drawMode, auxName);
  if (drawMode == 'text') {
    enterDrawMode('line');
  }
  return;
}

// every time the user drags their mouse
// this function will be executed
function onMouseDrag(event) {
  if (segment) {
      segment.point = event.point;
      path.smooth();
  } else if (movePath) {
    path.position += event.delta;
  } else {
    if (drawMode == 'line') {
      path.add(event.point);
    }
  }
}

function drawOnCanvas (x, y, p, drawMode, name) {
  if (!p && drawMode != "erase") {
    return;
  }
  
  switch (drawMode) {
    case "circle":
      path = new Path.Circle();
    break;
    case "rectangle":
      path = new Path.Rectangle();
    break;
    case "line":
      path = new Path();
    break;
    case "erase":
      var children = project.activeLayer.children;
      for (var i = 0; i < children.length; i++) {
       var child = children[i];
       if(child.name == name) {
         child.removeSegments();
       }
      }
    break;
    case 'text':
      path = new PointText(new Point(x, y));
      path.name = name;
      path.content = p[1].content;
      path.fillColor = p[1].fillColor;
      path.fontSize = p[1].fontSize;
      path.justification = p[1].justification;
      path.leading = p[1].leading;

      view.draw();
      return;

    break;
  }
  
  if(drawMode != "erase") {
    path.name = name;
    path.segments = p[1].segments;
    if(p[1].fillColor != 'undefined') {
      path.fillColor = p[1].fillColor;
    }
    path.strokeWidth = p[1].strokeWidth;
    path.strokeColor = p[1].strokeColor;
  }

  view.draw();
}

function emitPath( x, y, thepath, drawMode, name) {
  // Each Socket.IO connection has a unique session id
  var sessionId = io.socket.sessionid;
  // An object to describe the circle's draw data
  var data = {
    x: x,
    y: y,
    path: thepath,
    drawMode: drawMode,
    name: name
  };

  // send a 'drawCircle' event with data and sessionId to the server
  io.emit( 'drawOnCanvas', data, sessionId )
}

// Listen for 'drawOnCanvas' events created by other users
io.on( 'drawOnCanvas', function( data ) {
  // Draw the circle using the data sent
  // from another user

  drawOnCanvas( data.x, data.y, data.path, data.drawMode, data.name);//, data.color, "target" );
});


io.on('clearCanvas', function(data){
 var activeLayer = project.activeLayer;
 for (var i = 1; i < activeLayer.children.length; i++) {
    activeLayer.children[i].visible = false;
 }
  view.draw();
});

function clearCanvas() {

  var activeLayer = project.activeLayer;
  for (var i = 1; i < activeLayer.children.length; i++) {
     activeLayer.children[i].visible = false;
  }
  
  var sessionId = io.socket.sessionid;
  view.draw();
  io.emit('clearCanvas', null, sessionId);
}

io.on('undoWork', function(data){
  var children = project.activeLayer.children;
  for (var i = children.length - 1; i >= 1; i--) {
    if(children[i].visible) {
      children[i].visible = false;
      break;
    }
  }
  view.draw();
});

function undoWork() {

  var children = project.activeLayer.children;
  for (var i = children.length - 1; i >= 1; i--) {
    if(children[i].visible) {
      children[i].visible = false;
      break;
    }
  }
  view.draw();

  var sessionId = io.socket.sessionid;
  io.emit('undoWork', null, sessionId);
}