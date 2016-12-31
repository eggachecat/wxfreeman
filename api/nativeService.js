var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require("fs")

var wxIO = require("./wxIO") 


function loadOneFile(callback){
	dialog.showOpenDialog({ 
    filters: [
      { name: 'json', extensions: ['json'] }
    ]
  }, function (fileName) {
       if (fileName === undefined){
            console.log("You didn't save the file");
            return;
       }
       console.log(fileName)
       callback(wxIO.readJson(fileName[0]));
	}); 
}

function saveToFile(content){

	dialog.showSaveDialog(function (fileName) {

       if (fileName === undefined){
            console.log("You didn't save the file");
            return;
       }


       wxIO.writeJson(fileName, content);

	}); 
}

exports.loadOneFile = loadOneFile;
exports.saveToFile = saveToFile;