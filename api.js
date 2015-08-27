var db = require('./db.js');
var self = require('./api.js');
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer'); 

module.exports.registerUser = function * (opts){
  console.log("registerUser post data:" + JSON.stringify(opts));
  try{
      if(!opts.email || !opts.password){
	    throw new Error(JSON.stringify({"message":"Username and password not entered,plz enter details","err_code":404}));
	  }
	  var userExists = {};
	  var userExists = yield db.userCollection.findOne({"email":opts.email});
      console.log("user fields " + JSON.stringify(userExists));
	  if(!userExists){
        console.log("user not exists so create it");
          var userAdd ={};
          if(opts.lastname){
          	 userAdd.username = opts.firstname+" "+opts.lastname
          } else{
          	 userAdd.username = opts.firstname
          }
          userAdd.email = opts.email;
          userAdd.password = createHash(opts.password);  //opts.password;
          
          var veri_code = "";
          var text = "abcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++) {
                veri_code = veri_code + text.charAt(Math.floor(Math.random() * text.length));
          }
          userAdd["verification_code"] = veri_code;

          console.log("userAdd:",userAdd);
	      var result = yield db.userCollection.create(userAdd);
          console.log("this.body user registered:",result);
          if(result){
            /*var transporter = nodemailer.createTransport();*/
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'bhuvnesh.kumar@daffodilsw.com',
                    pass: '2015meias1rank'
                }
            });
      
            var mailOptions = {
                  from: 'bhuvnesh.kumar@daffodilsw.com', // sender address
                  to: result.email, // list of receivers
                  text: "http://192.168.100.44:3000/#/verifyuseremail/" + result.email + "/" + result.verification_code // plaintext body
            };

            transporter.sendMail(mailOptions, function(error, info) {
                  if (error) {
                      console.log(error);
                  } else {
                      console.log('Message sent: ' + info.response);
                  }
              });
	       }
	        // this.throw(200,res);
	        return result;

	  }else{
	      //console.log("Post Response:" + JSON.stringify(this.body));
	      throw new Error(JSON.stringify({"message":"User Already Exists","err_code":404}));
      }
    }catch (err){
     console.error(err.message);
	 throw err;
    }
}

// Generates hash using bcrypt
var createHash = function(password){
 return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}


module.exports.verifyUser = function * (opts){
  console.log("verifyUser data:" + JSON.stringify(opts));
  try {
      var user = {};
      var user = yield db.userCollection.findOne({"email":opts.email});
      console.log("-----------------------------");
      console.log("user verify result API:",user);

      if(!user) {
          throw new Error(JSON.stringify({"message":"User not found So can't be verified","err_code":404}));
      } else {
        console.log("1:",user.verification_code);
        console.log("2:",opts.verification_code);

        if (user.verification_code == opts.verification_code) {

          var userVerifyResult = yield db.userCollection.findOneAndUpdate({"email":opts.email},{"$set":{"verified":true}}); 
          /*db.userCollection.findOneAndUpdate({"email":opts.email},{"$set":{"verified":true}},function(err,result1){
            console.log("err:",err);
            console.log("result:",result);
          }); 
           */
          console.log("userVerifyResult:",userVerifyResult);
          if(userVerifyResult){
             userVerifyResult["verified"] = true;
             return userVerifyResult.toObject();
          } 
         
        } else {
          throw new Error(JSON.stringify({"message":"User can't be verified","err_code":404}));
        }

      }

    } catch (err) {
        console.log(err.stack);
        throw err;
    }

}

module.exports.loginUser = function * (opts){
  console.log("loginUser post data:" + JSON.stringify(opts));
  try{
      if(!opts.email|| !opts.password){
        //this.throw(404, 'Username and password not entered,plz enter details:');
          throw new Error(JSON.stringify({"message":"Username and password not entered,plz enter details","err_code":404}));
      }
      var user= {};
      var user = yield db.userCollection.findOne({"email":opts.email});
      console.log("user fields " + JSON.stringify(user));
    
      if (!user.email) {
          throw new Error(JSON.stringify({"message":"User not registered please signup","err_code":401}));
      } else if (isValidPassword(opts.password,user)){          //order important
          return user.toObject();
      } 
   }
   catch (err){
      console.error('catch me----',err.message);
      throw new Error(JSON.stringify({"message":"username_or_password_does_not_match","err_code":403}));  
   }
}

var isValidPassword = function(password,user){ 
  return bcrypt.compareSync(password,user.password);
}

/**
 *  Forgot password
 */
exports.forgotPassword = function*(opts) {
  console.log("User API forgotPassword: START OPTS:",opts);
  //console.log("user API verifyUser: email: "+ opts.email);
  if (opts.email){
     opts.email = opts.email.toLowerCase();
     console.log("opts.email:",opts.email);
  }else{
    throw new Error('400_email_can_not_be_blank');
  }

  try {
      var userForgotPassword = {};
      userForgotPassword = yield db.userCollection.findOne({"email": opts.email});
      if (!userForgotPassword)  
         throw new Error(JSON.stringify({"message":"there_is_no_user_with_this_email'","err_code":400}));

      var resetPasswordToken = "";
      var text = "abcdefghijklmnopqrstuvwxyz0123456789";
      for (var i=0; i < 8; i++) {
        resetPasswordToken = resetPasswordToken + text.charAt(Math.floor(Math.random() * text.length));
       }

       var passwordUpdate = yield db.userCollection.update({"email": opts.email},{"$set":{"reset_pass_token":resetPasswordToken}});
       console.log("passwordUpdate:",passwordUpdate);
        if (passwordUpdate) {
            //var transporter = nodemailer.createTransport();
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'bhuvnesh.kumar@daffodilsw.com',
                    pass: '2015meias1rank'
                }
            });
      
            var mailOptions = {
                 from: 'bhuvnesh.kumar@daffodilsw.com', // sender address
                 to: opts.email, // list of receivers
                 text: "http://192.168.100.44:3000/#/resetpassword/"+ opts.email + "/" + resetPasswordToken   // plaintext body
                        //text: resetPassInfo.password, // plaintext body
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                   console.log(error);
                } else {
                   console.log('Message sent: ' + info.response);
                }
            });
         
         userForgotPassword["resetPasswordToken"] = resetPasswordToken
         console.log("userForgotPassword:",userForgotPassword); 
         return userForgotPassword;
                  
      } 
    
  } catch(err){
     console.log("err:",err);
  }
}
