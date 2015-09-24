"use strict"
var config = {
    url: 'mongodb://192.168.100.44:27017/pplDb',
    server: {
      fileUpload: __dirname + '/fileUpload/uploads',
    },
    client :{
      url: 'http://192.168.100.44:8000/images'
    },
    image: {
      post_img:'/post_img/',
      user_img:'/user_img/',
    }
  }
 exports = module.exports = config; 