'use strict';

var router = require("koa-router");
var route = new router();

exports = module.exports = route;

route.post('/register', function*() {
  console.log(" Request type ---  " + JSON.stringify(this.request.type));
  console.log(" Request body signup ---  " ,this.request.body);

  /*try {
    var user = yield API.registerUser({
      "firstname":this.request.body.firstname,
      "lastname" : this.request.body.lastname,
      "email":this.request.body.email,
      "password": this.request.body.password
    });
    console.log("user:" ,user);
    this.body = user;
  } catch (err) {
    console.log("Singup Error in Index.js:",err);

    var ERR = JSON.parse(err.message);
    this.body = ERR.err_code + "_" + ERR.message;
    this.status = ERR.err_code;
  }*/
  this.body = "success";
});