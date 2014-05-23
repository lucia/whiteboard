/**
START INTERFACE
**/
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};
var currentItem = null;
var segment, path;
var movePath = false;
var pathName = 0;
var generatedPaths = new Array();

var clearWork = false;

var color = 'black', pencilSize = 1, drawMode = 'line', fill=true, text= '';
//switch draw mode
function enterDrawMode(modeType) {
  drawMode = modeType;
}

//change fill size
function setShapeSize(shapeSize) {
  pencilSize = $(shapeSize).val();
  enterDrawMode('line');
}

//change fill color
function setShapeColor(shapeColor) {
  color = $(shapeColor).val();
}

//set text to place on canvas
function setText(textToAdd) {
  if ($(textToAdd).val()) {
    enterDrawMode('text');
    console.log('My Text ', $(textToAdd).val());
    text = $(textToAdd).val();
  }
}

function resetInputText() {
  $('#text').val('');
  text = '';
  
  $('#text').blur();
}

//export the image
function saveWork() {
  var canvas = document.getElementById("draw");
  var dataURL = canvas.toDataURL();
  window.open(dataURL, "toDataURL() image", "width=" + canvas.width +", height=" + canvas.height);
}

//force no fill
function toggleFill() {
  fill = !fill;
  $('#fill_mode').html(fill ? ' [ON]' : ' [OFF]');
}

function showDrawer() {
   $('#tools_drawer').stop().animate({left: -10}, 'swing');
   $('#show_hide_btn').html("Hide tools");
   $('#show_hide_btn').unbind("click");
   $('#show_hide_btn').attr('onclick', '');
   $('#show_hide_btn').bind('click', function(){
     hideDrawer();
   })
}

function hideDrawer() {
  $('#tools_drawer').stop().animate({left: -186}, 'swing');
  $('#show_hide_btn').html("Show tools");
  $('#show_hide_btn').unbind("click");
  $('#show_hide_btn').attr('onclick', '');
  $('#show_hide_btn').bind('click', function(){
    showDrawer();
  });
}
/**
END INTERFACE
**/