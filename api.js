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
                  text: "http://192.168.100.44:3000/#/verify-email/" + result.email + "/" + result.verification_code // plaintext body
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
