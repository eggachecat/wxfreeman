
var opentype = require("./node_modules/opentype.js/dist/opentype");

var global_font = opentype.loadSync('assets/fz.ttf');


function getCharMatrix(char){


	var gly = global_font.charToGlyph(char);
	var path = gly.getPath(0,0,global_font.unitsPerEm);
	var boundingBox = path.getBoundingBox();

	

	var lengthUnit = 90;
	var anchorUnit = 100;
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
	};
}

var charMatrix = getCharMatrix("d");
var str = "";
for (var i = 0; i < charMatrix.height; i++) {
	for (var j = 0; j < charMatrix.width; j++) {
		if(charMatrix.map[[i, j]]){
			str += "◆ ";
		}else{
			str += "◇ ";
		}
	}
	str += "\n";
}

console.log(str);
console.log(charMatrix[[1,5]])



