var koa = require('koa');
var app = module.exports = koa();
var mount = require("koa-mount");
var bodyParser = require('koa-bodyparser');
var routes = require('./routes/index');
//var session = require('koa-session');
var session = require('koa-session-store');
var mongoStore = require('koa-session-mongoose');

//They take the data from your http POST and parse it into a more usable state
app.use(require('koa-cors')({
   methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS', //'POST,PUT,GET'                               //'GET,HEAD,PUT,POST,DELETE,OPTIONS',
   credentials: true                                            //credentials: true
 }));

/*app.use(function *(){
  this.body = 'Welcome to PPL';
});*/
                                           //app.keys = ['some secret key'];  // needed for cookie-signing 

var mongoose = require('mongoose');

var mongoConnection = mongoose.createConnection(
  'mongodb://localhost:27017/PPL-session'
);
                                           
// set cookie secret
app.keys = ['1234567890QWERTY'];

//app.use(session(app));

/*app.use(function *(){
  var n = this.session.views || 0;
  this.session.views = ++n;
  this.body = n + ' views';
})*/

/** @name Middlware for session store */
app.use(session({
  name: 'PPL-session',
  store: mongoStore.create({
    connection: mongoConnection,
    collection: 'sessions',
    expirationTime: 60 * 60 * 24 * 5  // 5 days
  }),
  cookie: {
    signed: true,      // cookie is signed using KeyGrip
    httpOnly: true,    // cookie is not accessible via client-side JS
    overwrite: true    // overwrite existing cookie datawhen setting cookie
  },
  cache: {
    ttl: 1000 * 10     // cache time to live in RAM before pass-through to store
  }
}));

app.use(bodyParser());
app.use(function *(next){
  try
    {
    console.log(">>>>>>>>>>",this.session);  
    yield next; 
    //pass on the execution to downstream middlewares
    } catch (err) 
    { 
    //executed only when an error occurs & no other middleware responds to the request
    this.type = 'json'; //optiona here
    this.status = err.status || 500;
    this.body = { 'error' : 'The application is not responding because of some error;) '};
    //delegate the error back to application
    this.app.emit('error', err, this);
    }
});

app.use(mount(routes.middleware()));

app.listen(3000);
console.log("server is listening at port 3000");