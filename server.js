var koa = require('koa');
var app = module.exports = koa();
var mount = require("koa-mount");
var bodyParser = require('koa-bodyparser');
var routes = require('./routes/index');

//They take the data from your http POST and parse it into a more usable state
app.use(require('koa-cors')({
   methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS', //'POST,PUT,GET'                               //'GET,HEAD,PUT,POST,DELETE,OPTIONS',
   credentials: true                                            //credentials: true
 }));

/*app.use(function *(){
  this.body = 'Welcome to PPL';
});*/


app.use(bodyParser());
app.use(function *(next){
  try
    {
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