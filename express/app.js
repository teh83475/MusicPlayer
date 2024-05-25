var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var monk = require('monk');
var cors =require('cors');
var db = monk('localhost:27017/musicplayer');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  req.db = db;
  next();
})

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

app.use(cors({
	Headers:'*',
	origin: 'http://localhost:3000',
	optionsSuccessStatus:200,
	credentials:true
}))



app.options('*', cors());


app.get('/',function(req,res){
  res.send("hi");
});


app.get('/getsong',function(req,res){
  var db = req.db;
	var data = db.get('songList');
  
  data.find().then((docs)=>{
    console.log(docs);
    console.log(typeof docs);
    res.send(docs);
    
  }).catch((err)=>{
    res.send(err);
  });
});


app.get('/getcollection',function(req,res){
  var db = req.db;
	var data = db.get('collectionList');
  
  data.find().then((docs)=>{
    console.log(docs);
    console.log(typeof docs);
    res.send(docs);
    
  }).catch((err)=>{
    res.send(err);
  });
});








// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(8081, () => {
	var host = server.address().address
	var port = server.address().port
	console.log("lab4 app listening at http://%s:%s", host, port)
});


module.exports = app;
