var passport = require('koa-passport');
var LocalStrategy = require('passport-local').Strategy
var co = require('co');
var userAPI = require("../api.js");

passport.serializeUser(function(user, done) {
  console.log("-----------------SerializeUser-------------------");
  // console.log("user is " + JSON.stringify(user));
  
  console.log("user id is " + user._id);
  done(null, user._id)
})

passport.deserializeUser(function(req, id, done) {
  console.log("deserializeUser")
  console.log("-----------------DeserializeUser-------------------" + id);
  if(req.user)
    done(null,req.user)
  co(function *(){
    var user;
    try{
      user = yield userAPI.findOneByid({id:id});
      if(!user)
      done( null,false);
      req.user = user;  
    }catch(err){
      done(err)
    }
    done(null,user);
  })()
})  

passport.use('local-login', new LocalStrategy({passReqToCallback:true,usernameField: 'email'},function(req, email, password, done) {
  console.log('Auth Local Login starts');
  console.log('Auth Local Login: username = %s ', email);
  /*var login_data = {
  	'email' : email, 
  	'password': password
  };*/
  co (function *() {
    try {
      //console.log("login_data in passport before function call:" +JSON.stringify(login_data));	
      var user = yield userAPI.loginUser({ 'email' : email, 'password': password });	
      /*var user = yield userAPI.login({ 'email' : email, 'password': password });*/
      // console.log("user is >>>>> " + JSON.stringify(user));
      console.log("user in passport.js" +JSON.stringify(user));
      req.user = user;
      done(null, user);
    } catch(err) {
      console.log("-------------err in auth2 " + err.message);
      done(err, null)
    }
  }).then(function(value) {
       /*console.log("value:",user);
       done(null, user);*/
  }, function (err) {
       console.error("<<<<<<<<<<<<<<<err after than:",err.stack);
       done(err,null);
  });
}))


// var LocalStrategy = require('passport-local').Strategy
passport.use('local-signup', new LocalStrategy({passReqToCallback:true,usernameField: 'email'},function(req,username,password,done) {
  console.log('Auth local signup starts');
  console.log('Requested body for signup:' +JSON.stringify(req.body));
  console.log('Auth local signup: username: ' + JSON.stringify(req.body.email));
  var signup_data = {
  	"firstname" : req.body.firstname,
  	"lastname" : req.body.lastname,
    "email":req.body.email,
    "password": req.body.password
  };

  console.log("Singup Data in passport.js:" +JSON.stringify(signup_data));
  co (function *() {
    try {
      var user = yield userAPI.registerUser(signup_data);
      done (null,user);
    } catch(err) {
      done(err)
    }
  }).then(function(value) {
       /*console.log("value:",user);
       done(null, user);*/
  }, function (err) {
       console.error("<<<<<<<<<<<<<<<err after than:",err.stack);
       done(err,null);
  });
}));

