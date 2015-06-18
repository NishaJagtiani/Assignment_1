var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './database.db';
var chatID = 101;

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/home.html');
});


fs.exists(dbFile, function(exists)
	{
		if(!exists)
		{
			console.log("yessss");
			fs.open(dbFile, 'w', function(err, fd)
			{
				//if(err) throw err;
				fs.close(fd);
			});

			var db = new sqlite3.Database(dbFile);
			db.run('CREATE TABLE `chatData` (' +
    		'`PerId` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,' +
    		'`Name` TEXT NOT NULL,' +
    		'`Msg` TEXT,' +
    		'`TDValue` DATETIME DEFAULT CURRENT_TIMESTAMP,' +
    		'`ChatID` INTEGER NOT NULL)');
    		db.close();
		}
	});

var db = new sqlite3.Database(dbFile);

function getDateTime()
{
var currentdate = new Date();

 var datetime = currentdate.getFullYear() + "-"
 + (currentdate.getMonth()+1) + "-"
 + currentdate.getDate() + " "
 + currentdate.getHours() + ":"  
 + currentdate.getMinutes() + ":" 
 + currentdate.getSeconds(); 

/*
var datetime = currentdate.getDate() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
*/
return datetime;
}

function insertChat(username, msg)
{
	// Insert some data using a statement:
	var statement = db.prepare('INSERT INTO `chatData` (`Name`, `Msg`, `TDValue`, `ChatID`) ' + 'VALUES (?, ?, ?, ?)');
	statement.run(username, msg , getDateTime(), chatID);
	statement.finalize();
}



io.on('connection', function(socket){

  socket.on('chat message', function(msg){

  	var datetime = getDateTime();
  	var fullmsg = socket.nickname + " : " + msg + " : " + datetime;
  	insertChat(socket.nickname, msg);
  	console.log(fullmsg);
    io.emit('chat message', fullmsg);
  });

  socket.on('joinchat', function(usrname){

  	socket.nickname = usrname;
  	console.log(usrname + ' has joined');
  	io.sockets.emit('onuserjoined' , usrname + ' has joined' );
  	
	var msgs = new Array();
  	db.all("SELECT * FROM chatData", function(err, rows)
  	{
  		rows.forEach(function(row) {
  			var m = row.Name + " : " + row.Msg + " @ " + row.TDValue;
  			msgs.push(m);			
  		});

  		socket.emit('chathistory', msgs);
  	});

  	
  	
  });

  socket.on('disconnect', function() {
  	console.log(socket.nickname + ' has left');
  	io.sockets.emit('onuserleft' , socket.nickname + ' has left' );
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});