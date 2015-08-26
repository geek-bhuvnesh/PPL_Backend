var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Welcome to PPL';
});

app.listen(3000);
console.log("server is listening at port 3000");