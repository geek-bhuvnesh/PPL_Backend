var koa = require('koa');
var app = module.exports = koa();
var mount = require("koa-mount");
var bodyParser = require('koa-bodyparser');

//They take the data from your http POST and parse it into a more usable state
app.use(require('koa-cors')({
   methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS', //'POST,PUT,GET'                               //'GET,HEAD,PUT,POST,DELETE,OPTIONS',
   credentials: true                                            //credentials: true
 }));

app.use(function *(){
  this.body = 'Welcome to PPL';
});

app.listen(3000);
console.log("server is listening at port 3000");