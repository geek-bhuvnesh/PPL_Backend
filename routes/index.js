'use strict';

var router = require("koa-router");
var route = new router();
var multer = require('koa-multer');
var API = require("../api.js");
var configPassport = require('./passport.js');
var passport = require('koa-passport');

exports = module.exports = route;

route.post('/register', function*() {
  console.log(" Request type ---  " + JSON.stringify(this.request.type));
  console.log(" Request body signup ---  " ,this.request.body);

  if(this.is('application/json')){
    
     if (this.request.body.password !== this.request.body.confirm_password) {
        this.status = 400;
        this.body = "Password and confirm password not matched";
        return;
     }

    if (!this.request.body.email) {
       this.status = 400;
       this.body = "Email Id cannot empty";
       return;
    }


    var p = this;
    try {
      yield passport.authenticate('local-signup', function*(err, user, info){
        if(err){
          var ERR = JSON.parse(err.message);
          p.status = ERR.err_code;
          p.body = ERR.message;
          return;
        }

        if(!user){
          p.status = 400;
          p.body = "Username or password not valid";
          return;
        }
        p.body = user;
        return;
      })  
    } catch(err) {
      p.status = 500;
      p.body = err;
      return;
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
        this.body = ERR.message;
        this.status = ERR.err_code;
    }

});


/*route.post('/login', function*() {
  
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
});*/


route.post('/login', function*(next) {
  console.log(" Request type ---  "+JSON.stringify(this.request.type));
  console.log(" Request body login ---  " ,this.request.body); 
  if(this.is('application/json')){
    var p = this;
    
   try {
    yield passport.authenticate('local-login', function*(err, user, info){
      console.log("err login index:" ,err);
      console.log("user login index:" ,user);
      console.log("info login index:" ,info);
      if(err){
        var ERR = JSON.parse(err.message);
        p.status = ERR.err_code;
        p.body =  ERR.message;
        return;
      }
      if(!user){
        p.status = 400;
        p.body = "Username or password not valid";
        return;
      }
      p.body = user;
     /* var session = p.cookies.get("epikko-session");
      yield cart_API.updateCart({"session_id":session , "user_id":user._id})*/
      yield p.login(user)
      return;
    }).call(this,next)  
   }catch(err){
      p.status = 500;
      p.body = err;
      return;
   } 
  
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
    console.log("err forgot password in index:",err);
    var ERR = JSON.parse(err.message);
    this.body = ERR.message;
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
    console.log("Reset Password Error in index:" +JSON.stringify(err));
    var ERR = JSON.parse(err.message);
    this.body = ERR.message;
    this.status = ERR.err_code;
  }
});

route.post('/post', function*() {
  
  console.log(" Request type --  "+JSON.stringify(this.request.type));
  console.log(" Request body post ---  " ,this.request.body);
  try {
    var post = yield API.postDetails({
      "postedBy":this.request.body.postedBy,
      "postTitle":this.request.body.postTitle,
     /* "creatorImage":this.request.body.creatorImage,
      "creatorName":this.request.body.creatorName,
      "postedOn":this.request.body.postedOn,*/
      "catType":this.request.body.catType,
      "postImage":this.request.body.postImage
     });
     console.log("post:" ,post);
     this.body = post;
  } catch (err) {
     console.log("err index:" ,err);
     /*console.log(" err.message index:" , err.message);
      console.log("err.err_code index:" ,err.err_code);
      console.log("err login:" ,err);*/
     var ERR = JSON.parse(err.message);
     this.body = ERR.message;
     this.status = ERR.err_code;
  }
});

route.post('/test', function*() {
  
  console.log(" Request type --  "+JSON.stringify(this.request.type));
  console.log(" Request body test ---  " ,this.request.body);
  try {
    var test = yield API.test(this.request.body);
     console.log("test:" ,test);
     this.body = test;
  } catch (err) {
     console.log("err login:" ,err);
     var ERR = JSON.parse(err.message);
     this.body = ERR.message;
     this.status = ERR.err_code;
  }
});

/**
 * @name get /logout
 * @desc
 * will remove user from session
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * 
 *
 * @example
 *
 * get /logout
 *
 */
route.get('/logout', function*() {
  console.log("LOGOUT CALLED:" ,this.session);
  // destroy the session
  // this.session.passport = {};
  this.session = null;
  // this.redirect(this.request.query.redirect_url || 'back');
  this.body={"message":"Successfully logout"};
});


route.get('/getAllCategories', function*() {
   console.log("Normal Request get request");
   try {
    var allCategories = yield API.allCategories();
    console.log("All Categories:" ,allCategories);
    this.body = allCategories;
    this.status = 200;
  } catch (err) {
    var ERR = JSON.parse(err.message);
    this.body = EERR.message;
    this.status = ERR.err_code;
  }

});

route.get('/getAllPosts', function*() {
   console.log("Normal Request get request");
   try {
    var allPosts = yield API.allPosts();
    console.log("All Posts:" ,allPosts);
    this.body = allPosts;
    this.status = 200;
  } catch (err) {
    var ERR = JSON.parse(err.message);
    this.body = ERR.err_code + "_" + ERR.message;
    this.status = ERR.err_code;
  }

});

/*
 * @name
 * @To upload Imge
 */

route.post('/imageUpload', function*() {

    try {
       /* console.log("Index:Requested Data:" + JSON.stringify(this.request.body));
        console.log("Index: Uploaded files:", this.req.files);*/
        this.body = this.req.files.file;
        this.status = 200;
    } catch (err) {
        console.log(err.stack);
    }


});


route.put('/like/:postid', function*() {
    console.log("Requested params:",this.params.postid);
    console.log("Requested body Like:",this.request.body);
    try {
      var like = yield API.likeCall({
         "postid":this.params.postid,
         "likeby" : this.request.body.likeby
        });
        console.log("like:" ,like);
        this.body = like;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.err_code + "_" + ERR.message;
        this.status = ERR.err_code;
    } 


});

route.put('/unlike/:postid', function*() {
    console.log("Requested params:",this.params.postid);
    console.log("Requested body Like:",this.request.body);
    try {
      var unlike = yield API.unlikeCall({
         "postid":this.params.postid,
         "likeby" : this.request.body.likeby
        });
        console.log("unlike:" ,unlike);
        this.body = unlike;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.err_code + "_" + ERR.message;
        this.status = ERR.err_code;
    } 


});

route.put('/getPost/:postid', function*() {
    console.log("Requested params:",this.params.postid);
    console.log("Requested body count:",this.request.body.clickCount);
    try {
      var singlePost = yield API.getPostData({
         "postid":this.params.postid,
         "clickCount": this.request.body.clickCount
        });
        console.log("singlePost:" ,singlePost);
        this.body = singlePost;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.err_code + "_" + ERR.message;
        this.status = ERR.err_code;
    } 


});

route.post('/addComment', function*() {
    console.log("Requested params:",this.request.body.postid);
    try {
      var comment = yield API.addComment({
         "postid":this.request.body.postid,
         "commentText" : this.request.body.commentText,
         "createdBy" : this.request.body.createdBy
        });
        console.log("comment:" ,comment);
        this.body = comment;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.err_code + "_" + ERR.message;
        this.status = ERR.err_code;
    } 


});


route.put('/flag/:postid', function*() {
    console.log("Requested params:",this.params.postid);
    console.log("Requested body Flag:",this.request.body);
    try {
      var flag = yield API.flagCall({
         "postid":this.params.postid,
         "flagby" :this.request.body.flagby
        });
        console.log("flag:" ,flag);
        this.body = flag;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.message;
        this.status = ERR.err_code;
    } 


});

route.put('/unflag/:postid', function*() {
    console.log("Requested params:",this.params.postid);
    console.log("Requested body Unflag:",this.request.body);
    try {
      var unflag = yield API.unflagCall({
         "postid":this.params.postid,
         "flagby" : this.request.body.flagby
        });
        console.log("unflag:" ,unflag);
        this.body = unflag;
    }catch (err) {
        console.log("err login:" ,err);
        var ERR = JSON.parse(err.message);
        this.body = ERR.message;
        this.status = ERR.err_code;
    } 
});

route.get('/newPosts/:existPostsLength', function*() {
   console.log("Normal Request get request:" +this.params.existPostsLength);
   try {
    var newPosts = yield API.newPosts(this.params.existPostsLength);
    //console.log("New Posts:" ,newPosts);
    this.body = newPosts;
    this.status = 200;
  } catch (err) {
    var ERR = JSON.parse(err.message);
    this.body = ERR.err_code + "_" + ERR.message;
    this.status = ERR.err_code;
  }

});



