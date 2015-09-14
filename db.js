var mongoose = require('mongoose');
var config = require('./config');

// Mongoose connection to MongoDB 
mongoose.connect(config.url, function (error) {
    if (error) {
        console.log(error);
    }
});

var db = mongoose.connection;
db.on('error', function callback(err) {
    console.log("Database connection failed. Error: " + err);
});
db.once('open', function callback() {
   console.log("Database connection successful.");
});

var Schema = mongoose.Schema,Objectid = Schema.ObjectId;

var userSchema = new Schema({
  username : {type:String,default:""},
  email: {type:String,default:"",required: true},
  password : {type:String,default:""},
  reset_pass_token:{type: String,default: ""},
  verification_code:{type:String,default:""},
  verified:{type:String,default:false},
  role : String,
  photo: {type:String,default :""},
  posts : [{ type: Schema.Types.ObjectId, ref: 'postCollection' }]                                            //['user', 'admin'],
},{"collection":"userCollection"});

module.exports.userCollection  = mongoose.model('userCollection', userSchema);

var postSchema = new Schema({	
  postedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' },
  /*userId : {type:String,default:""},*/
  postTitle : {type:String,default:""},
  /*creatorImage: {type:String,default:""},
  creatorName : {type:String,default:""},*/
  postedOn : {type:Date ,default: Date.now},
  catType : {type:String},
  postImage:{type: String,default: ""},
  comments : [{
                commentText : {type:String},
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,ref: 'userCollection'
                },
                commentedOn : {type: Date,default: Date.now}
             }],
  /*comments:[{
  	         creatorId:{type:String},
  	         creatorName:{type:String},
             creatorComment:{type:String},
             commentedOn:{type:Date,default: Date.now},
  }],*/
  commentcount :{type:Number,default:0},
  likeby:[{type:String,default:[]}],
  likecount :{type:Number,default:0},
  flagby:[{type:String,default:[]}],
  flagcount :{type:Number,default:0},
  clickCount :{type:Number,default:0},
  featuredPost: {type:Boolean,default:false}

},{"collection":"postCollection"});

postSchema.index({postTitle: 1}, {unique: true});

module.exports.postCollection  = mongoose.model('postCollection', postSchema);


var categorySchema = new Schema({
	catName : {type:String,default:"others"},
  image : {type:String}
},{
	"collection":"categoryCollection"
});
module.exports.categoryCollection  = mongoose.model('categoryCollection', categorySchema);


var rolesSchema = new mongoose.Schema({
    'name':{type:String},
    'actions':[{type:String}]
});

module.exports.rolesCollection = mongoose.model('roles', rolesSchema);
