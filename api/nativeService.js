var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require("fs");

var wxIO = require("./wxIO");

var opentype = require("./node_modules/opentype.js/dist/opentype");

var global_font = opentype.loadSync(require("path").resolve(__dirname, 'assets/fz.ttf'));

function loadOneFile(callback){
	dialog.showOpenDialog({ 
    defaultPath: require("path").resolve(__dirname, 'saves'),
    filters: [
      { name: 'json', extensions: ['json'] }
    ]
  }, function (fileName) {
       if (fileName === undefined){
            console.log("Failed to load any file");
            return;
       }
       console.log(fileName)
       callback(wxIO.readJson(fileName[0]));
	}); 
}

function saveToFile(content){

	dialog.showSaveDialog({
     defaultPath: require("path").resolve(__dirname, `saves/${Number(new Date())}.json`),
  }, function (fileName) {

       if (fileName === undefined){
            console.log("Failed to save the file");
            return;
       }


       wxIO.writeJson(fileName, content);

	}); 
}

function getCharMatrix(char){


  var gly = global_font.charToGlyph(char);
  var path = gly.getPath(0,0,global_font.unitsPerEm);
  var boundingBox = path.getBoundingBox();

  
  var baseX = boundingBox.x1;
  var baseY = boundingBox.y1;


  var _map = {};

  console.log(boundingBox)

  var normalizedPath = [];
  for (var i = 0; i < path.commands.length - 1; i++) {

    var command = path.commands[i];

    var _type = command["type"];
    var _x = command.x - baseX;
    var _y = command.y - baseY;
    
    switch(_type)
    {
      case "M":
        _x = _x / 100;
        _y = _y / 100;
        // due to the coordinates systems are symmetry
        _map[[_y, _x]] = true;
        break;
      case "L":
        
        break;
    }
  }
  return {
    "map": _map,
    "width": (boundingBox.x2 - baseX) / 100,
    "height": (boundingBox.y2 - baseY) / 100  
  }
}

exports.loadOneFile = loadOneFile;
exports.saveToFile = saveToFile;
exports.getCharMatrix = getCharMatrix;