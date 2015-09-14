var db = require('./db.js');
var self = require('./api.js');
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer'); 
var crypto = require('crypto');
var mongoose = require('mongoose');
var reversePopulate = require('mongoose-reverse-populate');

var encrypt = function(text) {
    
   console.log("encrypt text:",text); 
   var cipher = crypto.createCipher('aes-256-cbc', 'd6F3Efeq')
   var crypted = cipher.update(text, 'utf8', 'hex')
   crypted = crypted + cipher.final('hex');
   return crypted;
}

var decrypt = function(text) {
   var decipher = crypto.createDecipher('aes-256-cbc', 'd6F3Efeq')
   var dec = decipher.update(text, 'hex', 'utf8')
   dec += decipher.final('utf8');
   return dec;
}

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
                    pass: 'techfreak123'
                }
            });

           /* var encypt_mail = encrypt(result.email);
            console.log("encypt_mail:",encypt_mail);*/
      
            var mailOptions = {
                  from: 'bhuvnesh.kumar@daffodilsw.com', // sender address
                  to: result.email, // list of receivers
                  subject: 'Verify your PPL Account', // Subject line
                  text: "http://192.168.100.44:8000/#/verifyuseremail/" + result.email + "/" + result.verification_code // plaintext body
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
	      throw new Error(JSON.stringify({"message":"User Already Exist with this Email id","err_code":404}));
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
  console.log("verifyUser data:" + opts.email);
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
      if(!opts.email||!opts.password){
        //this.throw(404, 'Username and password not entered,plz enter details:');
          throw new Error(JSON.stringify({"message":"Username and password not entered,plz enter details","err_code":404}));
      }
      //var user= {};
      console.log("------------->>>>>>>>>>>>>>>>>>>>>>>>>>>");
      //var user = opts;
      var user = yield db.userCollection.findOne({email: opts.email.toLowerCase()}).exec();
   /*   var user = yield db.userCollection.findOne({"email":opts.email});*/
      console.log("user fields " + JSON.stringify(user));
      console.log("user typeof  " + typeof user);
      if (!user) {
          throw new Error(JSON.stringify({"message":"User not registered please signup","err_code":401}));
      } else if (isValidPassword(opts.password,user)){
          console.log("user:",user)          //order important
          return user.toObject();
      } else{
          console.log("<<<<<<<<<<<<<<<<<");
          throw new Error(JSON.stringify({"message":"Please Enter valid password","err_code":400}));
      }
   }
   catch (err){
      console.error('catch me----',err.message);
      /*throw new Error(JSON.stringify({"message":"username_or_password_does_not_match","err_code":403}));  */
      throw err;
   }
}

var isValidPassword = function(password,user){ 
  return bcrypt.compareSync(password,user.password);
}

/**
 * Try login with username and password
 */
exports.findOneByid = function*(opts) {
  console.log('UserAPI findOneByid: START');
  var user = yield db.userCollection.findOne({_id: opts.id}).exec();
  if (user) {
    return user;
  }
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
      if (!userForgotPassword){ 
         throw new Error(JSON.stringify({"message":"there_is_no_user_with_this_email","err_code":400}));
         return;
      } 
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
                    pass: 'techfreak123'
                }
            });
      
            var mailOptions = {
                 from: 'bhuvnesh.kumar@daffodilsw.com', // sender address
                 to: opts.email, // list of receivers
                 subject: 'Reset Your password',
                 text: "http://192.168.100.44:8000/#/resetpassword/"+ opts.email + "/" + resetPasswordToken   // plaintext body
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
     throw err;
  }
}


/**
 * Reset Password and return User
 * @param {string} new_password - new_password of User
 *
 * @return {object} Reset - User
 */


exports.resetPassword = function*(opts) {

  console.log("UserAPI resetPassword START:" ,opts);

  if (!opts.new_password) {
    console.log("API resetPassword: New password not given");
    throw new Error(JSON.stringify({"message":"new_password_cannot_be_blank","err_code":400}));
  }
  if (!opts.reset_pass_token) { //fpcode is mandatory for resetting own password.
    console.log("API resetPassword: reset_pass_token is not given");
    throw new Error(JSON.stringify({"message":"reset_pass_token_is_not_given","err_code":400}));
  }

  var user;
  var filter = {};
  filter.reset_pass_token = opts.reset_pass_token;
  filter.email = opts.email;
  user = yield db.userCollection.findOne(filter);

  console.log("user in API:" ,user);

  // console.log("UserAPI resetPassword user:" +JSON.stringify(user));
  if (!user) {
    throw new Error(JSON.stringify({"message":"user_doesnot_exist_for_this_email","err_code":400}));
  }
  if(user){
     var passwordeHashed = createHash(opts.new_password);
     console.log("passwordeHashed:",passwordeHashed); 
     var result = yield db.userCollection.update({"email": opts.email},{"$set":{"password":passwordeHashed}});
     console.log("resetPassword res:",result);
        // this.throw(200,res);
     if(result){
      var resetPassResult = {};
      resetPassResult = user;
      console.log("resetPassResult Before Password:",resetPassResult);
      resetPassResult["password"] = opts.new_password;
      console.log("resetPassResult After Password:",resetPassResult);
      return resetPassResult;

     }else{
        throw new Error(JSON.stringify({"message":"Error in Password Set","err_code":400}));
     }

  }

}

module.exports.postDetails = function * (opts){
  console.log("postDetails post data:" + JSON.stringify(opts));
  console.log("--------typeof------------:" + typeof opts);
  try{
      if(!opts.postedBy|| !opts.postTitle){
        //this.throw(404, 'Username and password not entered,plz enter details:');
          throw new Error(JSON.stringify({"message":"User and post title not entered,plz enter details","err_code":404}));
      }
      var post= {};
      var post = yield db.postCollection.create(opts);
      console.log("post fields: " + JSON.stringify(post));
    
      if (!post._id) {
          throw new Error(JSON.stringify({"message":"post can't be created","err_code":401}));
      } else {          //order important
          var PostWithUserData = yield db.postCollection.findOne({"_id":post._id}).populate('postedBy').populate('comments.createdBy');
          console.log("----------------------------"); 
          console.log("PostWithUserData:",PostWithUserData); 
          return PostWithUserData.toObject();
      } 
   }
   catch (err){
      console.log("err",err);
      console.error('catch code----',err.code);
      console.error('catch message----',err.message);
      if(err.code ==11000){
        //throw new Error({"message":"Post Already Exists with this title,please choose differnt name","err_code":403});
        throw new Error(JSON.stringify({"message":"Post Already Exists with this title,please choose differnt name","err_code":400})); 
      } else{
        throw new Error(JSON.stringify({"message":"post can't be created","err_code":403}));  
      }
    
   }
}

module.exports.test = function * (opts){
 
  //console.log("postedBy:",opts);
  //postedBy = 
  /*var postedBy = {"_id" : "55e417e0c2f166631f1c1298",
  "verified" : "true",
  "verification_code" : "0ai12syd",
  "reset_pass_token" : "smz6pt5h",
  "password" : "$2a$10$1ymMx8NhJNd/1rnowhhpL.TvUpOzrlEyx05iIdGdhMy7H64.Hbgvy",
  "email" : "geek.bhuvnesh@gmail.com",
  "username" : "Bhuvnesh kumar",
  "__v" : 0 }*/

  console.log("postedBy:",opts.postedBy);
  console.log("postedBy type:", typeof opts.postedBy);

  try{
      var test= {};
      var test = yield db.postCollection.find({}).populate('postedBy').populate('comments.createdBy');

      console.log("test fields: " + JSON.stringify(test));
      return test;
      /*if (!test._id) {
          throw new Error(JSON.stringify({"message":"post can't be created","err_code":401}));
      } else {          //order important
          return test.toObject();
      } */
   }
   catch (err){
      console.error('catch me----',err.message);
      throw new Error(JSON.stringify({"message":"post can't be created","err_code":403}));  
   }
}


module.exports.allCategories = function * () {

 console.log("UserAPI allCategories START");
 try {

    var allCategories = yield db.categoryCollection.find({});

    if (!allCategories) throw new Error(JSON.stringify({"message":"no_category_found","err_code":400}));
     console.log("UserAPI All Categories:" , allCategories);
     return allCategories;
  }catch (err){
     console.error(err.message);
     throw err;
  }
 
}

module.exports.allPosts = function * () {

 console.log("UserAPI allPosts START");
 try {

    var allPosts = yield db.postCollection.find({}).sort({postedOn: 1}).populate('postedBy').populate('comments.createdBy');

    if (!allPosts) throw new Error(JSON.stringify({"message":"no_posts_found","err_code":400}));
     console.log("UserAPI All Categories:" , allPosts);
     return allPosts;
  }catch (err){
     console.error(err.message);
     throw err;
  }
 

}
 
module.exports.likeCall = function * (opts){
 console.log("Like opts in API:",opts);
 console.log("Like by in Api:",opts.likeby);
  try {

   /* var likeBy = yield db.postCollection.update({"_id":opts.postid,"likeby" : { "$nin" : [opts.likeby]  } },
                      { $push: {"likeby": opts.likeby }});*/
    var likeByData = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$addToSet": { "likeby": opts.likeby} },{ "new": true }).exec();
    var lengthOfLikeby = likeByData.likeby.length;
    var updateLikeCount = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$set":{"likecount":lengthOfLikeby}},{ "new": true });
    if(!updateLikeCount){
       throw new Error(JSON.stringify({"message":"There is some error to post like","err_code":400}));
    }
    return updateLikeCount;

  }catch (err){
     console.error(err.message);
     throw err;
  }

}


module.exports.unlikeCall = function * (opts){
 console.log("unlLike opts in API:",opts);
 console.log("unlLike by in Api:",opts.likeby);
  try {

    var unlikeData = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$pull": { "likeby": opts.likeby },"$inc":{"likecount":-1}},{ "new": true });
    console.log("unlikeData",unlikeData);
    if(!unlikeData){
      throw new Error(JSON.stringify({"message":"There is some error to unlike post ","err_code":400}));
    }

    return  unlikeData;
   
  }catch (err){
     console.error(err.message);
     throw err;
  }

}

module.exports.getPostData = function * (opts){

 console.log("Postid in Api:",opts.postid);
  try {

    var singPostData = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$inc":{"clickCount" :1}},{ "new": true }).populate('postedBy').populate('comments.createdBy').exec();
   /* var singPostData = yield db.postCollection.findOne({"_id":opts.postid}).populate('postedBy').populate('comments.createdBy').exec();*/
    console.log("singPostData",singPostData);
    if(!singPostData){
      throw new Error(JSON.stringify({"message":"There is some error to unlike post ","err_code":400}));
    }

    return  singPostData;
   
  }catch (err){
     console.error(err.message);
     throw err;
  }

}

module.exports.addComment = function * (opts){
 console.log("addComment opts in API:",opts);
  try {
    if(!opts.commentText){
       throw new Error(JSON.stringify({"message":"comment text is not entered,please enter text:","err_code":400}));
    }
    if(!opts.createdBy|| !opts.postid){
        //this.throw(404, 'Username and password not entered,plz enter details:');
          throw new Error(JSON.stringify({"message":"comment creator and post id not entered,plz enter details","err_code":404}));
    }
    //var addCommentData = yield db.postCollection.findByIdAndUpdate({"_id":opts.postid},{"$push":{"comments":{"$each":{ "commentText": opts.commentText,"createdBy": opts.createdBy},"$position":0}},"$inc":{"commentcount":1}},{ "new": true });
    var addCommentData = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$push":{"comments":{"$each":[{ "commentText": opts.commentText,"createdBy": opts.createdBy}],"$position":0}},"$inc":{"commentcount":1}},{ "new": true }).populate('postedBy').populate('comments.createdBy').exec();
    console.log("addCommentData",addCommentData);
    if(!addCommentData){
      throw new Error(JSON.stringify({"message":"There is some error to add comment ","err_code":400}));
    }

    return  addCommentData;
   
  }catch (err){
     console.error(err.message);
     throw err;
  }

}


module.exports.flagCall = function * (opts){
 console.log("flag opts in API:",opts);
 console.log("flag by in Api:",opts.flagby);
  try {

   /* var likeBy = yield db.postCollection.update({"_id":opts.postid,"likeby" : { "$nin" : [opts.likeby]  } },
                      { $push: {"likeby": opts.likeby }});*/
    var flagData = yield db.postCollection.update({"_id":opts.postid,"flagby": { "$nin": [ opts.flagby] } },{"$addToSet": { "flagby": opts.flagby},"$inc":{"flagcount":1} },{ "new": true }).exec();
    
    
    if(!flagData){
       throw new Error(JSON.stringify({"message":"There is some error to post flag","err_code":400}));
    } else {
      var updatedFlagData = yield db.postCollection.findOne({"_id":opts.postid}).exec();
    }
    console.log("Flag Data" ,updatedFlagData);
    return updatedFlagData;

  }catch (err){
     console.error(err.message);
     throw err;
  }

}


module.exports.unflagCall = function * (opts){
 console.log("unflag opts in API:",opts);
 console.log("unflag by in Api:",opts.likeby);
  try {

    var unflagData = yield db.postCollection.findOneAndUpdate({"_id":opts.postid},{"$pull": { "flagby": opts.flagby },"$inc":{"flagcount":-1}},{ "new": true });
    console.log("unflagData",unflagData);
    if(!unflagData){
      throw new Error(JSON.stringify({"message":"There is some error to unflag post ","err_code":400}));
    }

    return  unflagData;
   
  }catch (err){
     console.error(err.message);
     throw err;
  }

}



