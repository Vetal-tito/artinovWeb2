let express = require('express');
let path = require('path');
let app = express();
let bodyParser = require('body-parser');
let fs = require('fs');
var mongoClient = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var Cookies = require( "cookies" );

var url = "mongodb://localhost:27017/test";


app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');
 
app.use((req, res, next)=>{
	//console.log(req.url);
	//console.log('Test function 1');
	next();
});

app.use('/',express.static(path.join(__dirname, 'public')));

// app.get('/', function (req, res) {
//   res.send('Hello World')
// });

app.get('/about', function (req, res) {
	
	var cookies = new Cookies( req, res); 
	cookies.set( "name", "Lex", { httpOnly: false, maxAge: 9999 } )
   res.render('about', {
   	title: 'about',
   	content: 'about content',
   });
});

app.get('/info', function (req, res) {
  res.render('info');
});

app.get('/help', function (req, res) {
  res.render('page',{
  	title: 'help',
  	content: 'Content help'
  });
});

app.get('/contact', function (req, res) {
  res.render('page',{
  	title: 'contact',
  	content: 'Content contact'
  });
});

app.get('/user/add', function (req, res) {
  res.render('adduser',{
  	title: 'Add user'
  });
});

app.get('/user/edit/:id', function (req, res) {

	var id = new objectId(req.params.id);
    mongoClient.connect(url, function(err, db){
        db.collection("users").findOne({_id: id}, function(err, user){
             
             console.log(user);
            if(err) return res.status(400).send();
             
            db.close();

            res.render('edituser',{
		  		title: 'Edit user',
		  		user,
	  		});
        });
    });
 
});


app.get('/user/delete/:id', function (req, res) {

	var id = new objectId(req.params.id);
    mongoClient.connect(url, function(err, db){
        db.collection("users").findOneAndDelete({_id: id}, function(err, result){
             
            if(err) return res.status(400).send();
             
            //var user = result.value;
            //res.send(user);
            db.close();
            res.redirect('/users');
        });
    });
});

app.post('/user/edit/:id', function (req, res) {
  	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!s');
	if(!req.body) return res.sendStatus(400);
	var id = new objectId(req.params.id);
    const {login, pass} = req.body;
     
    mongoClient.connect(url, function(err, db){
        db.collection("users").findOneAndUpdate({_id: id}, { $set: {login, pass}},
             {returnOriginal: false },function(err, result){
             
             console.log("result = ", result);
            if(err) return res.status(400).send();
             
            var user = result.value;
            db.close();
            res.redirect('/users');
        });
    });

});


app.get('/users', function (req, res) {
  
  mongoClient.connect(url, function(err, db){
        db.collection("users").find({}).toArray(function(err, users){
            res.render('allUser',{
			  	title: 'All user',
			  	data: users,
			 });
            db.close();
        });
    });

});

app.post('/user/add', function (req, res) {

  

  if(!req.body) return res.sendStatus(400);
     
    const {login, pass} = req.body;
    var user = {login, pass};
     
    mongoClient.connect(url, function(err, db){
        db.collection("users").insertOne(user, function(err, result){
             
            if(err) return res.status(400).send();

            db.close();
            res.redirect('/users');
        });
    });

});


app.use((req, res, next)=>{
	console.log(req.url);
	res.send('Error 404 not found!');
	next();
});

app.use((error, req, res, next)=>{
	console.log(error);
	console.log(req.url);
	res.send('Error 500 server not work!');
	next();
});


app.listen(3001);


function load(done){
	
	fs.readFile('db.txt', 'utf-8', (error, data) => {
		if(error){
			done('Неможливо прочитати файл');
		}

		let rez = null;
		try{
			rez = JSON.parse(data);
			done(null, rez);
		}catch(e){
			done('Неможливо розпарсити стрічку');
		}

	});
}

function save(data, done){
	let stringRez = JSON.stringify(data);
	fs.writeFile("db.txt", stringRez, (error) => {

		if(error){
			done('Неможливо записати файл');
		}

		done(null);
	});
}