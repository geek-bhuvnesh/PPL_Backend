
var config = require('./config.js');
var path = require('path');
var Promise = require('bluebird');
/*var gm = require('gm');*/

var gm = require('gm').subClass({ imageMagick: true });
//var gm = require("imagemagick"); 

var img_path = {};

exports = module.exports = {
  
imageSave : function *(image, size_width, size_hight) {
  console.log("Inside api helper imageSave:");
  console.log("image:" ,image);
  console.log("size_width:" ,size_width);
  console.log("size_hight:" ,size_hight);
  try{

  name = image.name;
  console.log("name:" ,name);
  var imgTarget = path.join(config.server.fileUpload, name);
  
  yield new Promise(function(resolve, reject) {
	console.log("imgTarget:",imgTarget);
  console.log(">>>>>>>>>>>" +config.client.url);
  gm(image.path).options({imageMagick: true}).resize(size_width, size_hight)
    .write(imgTarget, function(err,result){
      console.log("Err:",err);
      console.log("result:",result);
      if (err) {
		   console.log("Image magic error:" ,err);
        return err;
        reject(err);
      } else {
        resolve()
      }
    })
   })
  
  return name;
  }catch(err){
	 //console.log ("error imageSave:"+err);
     throw(err)
   }
 }
 
}

