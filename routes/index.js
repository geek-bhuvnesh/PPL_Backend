'use strict';

var router = require("koa-router");
var route = new router();
var API = require("../api.js");

exports = module.exports = route;

route.post('/register', function*() {
  console.log(" Request type ---  " + JSON.stringify(this.request.type));
  console.log(" Request body signup ---  " ,this.request.body);

  if(this.is('application/json')){
    // if(!this.request.body.username) {
    //   this.status = 400;
    //   this.body = "Username can not be empty";
    //   return;
    // }

     if (this.request.body.password !== this.request.body.confirm_password) {
        this.status = 400;
        this.body = 400 + "_password_not_matched";
        return;
     }

    if (!this.request.body.email) {
       this.status = 400;
       this.body = 400 + "_email_cannot_empty";
       return;
    }

    try {
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
    }
  }
    
});

route.get('/verifyuser/:email/:verification_code', function*() {
  console.log(" Request type ---  " + JSON.stringify(this.request.type));
  console.log(" Request params verify email---  " ,this.params.email);
  console.log(" Request params verify  verification_code---  " ,this.params.verification_code);

    try {
        var verifyUserDetails = {
            email: this.params.email,
            verification_code: this.params.verification_code
        };
        var user = yield API.verifyUser(verifyUserDetails);
        console.log("verify user result in index.js:",user);
        this.body = user;   

    } catch (err) {
        console.log(err.stack);
        console.log("verify user Error in Index.js:",err);

        var ERR = JSON.parse(err.message);
        this.body = ERR.err_code + "_" + ERR.message;
        this.status = ERR.err_code;
    }

});


route.post('/login', function*() {
  
  console.log(" Request type --  "+JSON.stringify(this.request.type));
  console.log(" Request body login ---  " ,this.request.body);
  try {
    var user = yield API.loginUser({
      "email":this.request.body.email,
      "password":this.request.body.password
     });
      console.log("user:" ,user);
      this.body = user;
  } catch (err) {
     console.log("err login:" ,err);
     var ERR = JSON.parse(err.message);
     this.body = ERR.err_code + "_" + ERR.message;
     this.status = ERR.err_code;
  }
});

/** Forgot Password
 *  @param <String> email : Primary email of user
 *  return a link to change password and send the link through email
 */

route.post('/forgotpassword',function*() {
  console.log("POST /users/email/" + this.request.body.email + "/forgotpassword handler start");

  if(!this.request.body.email) {
    this.body = ({email: 'Email is not valid'});
    this.status = 400;
    return;
  }
  
  try {
    var userExist = yield API.forgotPassword({
      email: this.request.body.email
    });
    this.body = userExist;
    this.status = 200;
    console.log("this.body:",JSON.stringify(this.body) + "," + "this.status:",this.status);
  } catch (err) {
    var ERR = JSON.parse(err.message);
    this.body = ERR.err_code + "_" + ERR.message;
    this.status = ERR.err_code;
  }
});

route.post('/resetpassword/:email', function *() {
  console.log("POST /resetpassword/" + this.request.body.reset_pass_token + "/" + this.params.email + " handler start");
  var validation_errors = [];
 
  console.log("Reset Password body:" ,this.request.body);

  if (!this.request.body && !this.request.body.new_password) {
    this.body = {};
    this.body.errors = {password: "new_password is not valid"};
    this.status = 400;
    return;  
  }
  console.log("index resetpassword: params" + JSON.stringify(this.params.email));
  try {
    var user = yield API.resetPassword({
      email: this.params.email,
      new_password: this.request.body ? this.request.body.new_password : null,
      reset_pass_token: this.request.body.reset_pass_token
    });
    this.body = user;
    this.status = 200;
  } catch (err) {
    var ERR = JSON.parse(err.message);
    this.body = ERR.err_code + "_" + ERR.message;
    this.status = ERR.err_code;
  }
});

