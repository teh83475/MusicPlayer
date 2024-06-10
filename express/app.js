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

app.post('/login', express.urlencoded({ extended: true }),function(req,res){//not done
  var db = req.db;
	var data = db.get('userList');
  
  console.log("username: ",req.body.username);
  console.log("password: ",req.body.password);
  data.find({name:req.body.username}).then((docs)=>{
    console.log(docs[0]);
    
    
    if (docs[0].password===req.body.password){
      //res.cookie('username', docs[0].name, { maxAge: 3600 * 1000 });
      res.send(docs[0].name);
    } else {

      res.send("Failed");
    }
    
  }).catch((err)=>{
    console.log("error");
    res.send(err);
  });
  

  
});


app.get('/logout', function(req,res){//not done
  
  
 
  res.send("ok");
  

  
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
  
  data.find({owner: req.query.username}).then((docs)=>{
    console.log(docs);
    console.log(typeof docs);
    res.send(docs);
    
  }).catch((err)=>{
    res.send(err);
  });
});

app.post('/addtocollection', express.urlencoded({ extended: true }),function(req,res){//not done
  var db = req.db;
	var data = db.get('collectionList');
  
  console.log("username: ",req.body.username);
  console.log("song: ",req.body.song);
  console.log("collection: ",req.body.collection);
  data.find({name:req.body.collection}).then((docs)=>{
    console.log(docs[0].list);
    console.log("pos: ",docs[0].list.indexOf(req.body.song));
    if (docs[0].list.indexOf(req.body.song)>=0){
      res.send("In collection already");
    } else {
      var id=docs[0]._id;
      var new_list=docs[0].list;
      new_list.push(req.body.song);
      data.update({_id :id}, { $set: { list:new_list } });
      res.send("Success");
    }
    
  }).catch((err)=>{
    console.log("error");
    res.send(err);
  });

  
});

app.post('/removefromcollection', express.urlencoded({ extended: true }),function(req,res){//not done
  var db = req.db;
	var data = db.get('collectionList');
  console.log("===============REMOVING FROM COLLECTION===============")
  console.log("username: ",req.body.username);
  console.log("song: ",req.body.song);
  console.log("collection: ",req.body.collection);
  data.find({name:req.body.collection}).then((docs)=>{
    console.log(docs[0].list);
    console.log("pos: ",docs[0].list.indexOf(req.body.song));

    var index=docs[0].list.indexOf(req.body.song)
    if (index>=0){
      var id=docs[0]._id;
      var new_list=docs[0].list;
      new_list.splice(index,1);
      console.log("===After: ", new_list);
      data.update({_id :id}, { $set: { list:new_list } });
      res.send("Success");
    } else {
      
      res.send("Not in this collectoin");
    }
    
  }).catch((err)=>{
    console.log("error");
    res.send(err);
  });

  
});

app.post('/newcollection', express.urlencoded({ extended: true }),function(req,res){//not done
  var db = req.db;
	var data = db.get('collectionList');
  
  console.log("username: ",req.body.username);
  console.log("collection_name: ",req.body.collection_name);
  data.find({name:req.body.collection_name}).then((docs)=>{
    console.log("collection found: ",docs[0]);
    
    if (!docs[0]){
      data.insert({'owner': req.body.username, 'name': req.body.collection_name, 'list': Array()});
      res.send("Success");
    } else {
      res.send("Failed");
    }
    
  }).catch((err)=>{
    console.log("error");
    res.send(err);
  });
});

app.post('/removecollection', express.urlencoded({ extended: true }),function(req,res){//not done
  var db = req.db;
	var data = db.get('collectionList');
  
  console.log("username: ",req.body.username);
  console.log("collection_name: ",req.body.collection_name);
  data.find({name:req.body.collection_name}).then((docs)=>{
    console.log("collection found: ",docs[0]);
    
    if (docs[0]){
      data.remove({'owner': req.body.username, 'name': req.body.collection_name});
      res.send("Success");
    } else {
      res.send("Failed");
    }
    
  }).catch((err)=>{
    console.log("error");
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
