
var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './database.db';
var chatID = 101;

var usersonline = new Array();

app.use(express.static('public'));

/* Directs to our Login page */
app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/public/home.html');
});


      /* Opens the existing DB if not existed creates a new one */
      fs.exists(dbFile, function(exists)
      	{
      		if(!exists)
      		{
      			console.log("DB CONNECTED");
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



    /* Time Date Display */
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

      return datetime;
      }




      /* Inserts data into the table*/

    function insertChat(username, msg)
    {
    	
    	var statement = db.prepare('INSERT INTO `chatData` (`Name`, `Msg`, `TDValue`, `ChatID`) ' + 'VALUES (?, ?, ?, ?)');
    	statement.run(username, msg , getDateTime(), chatID);
    	statement.finalize();
    }



/* once the chat room connection establishes */

io.on('connection', function(socket)
  {

        /* Displays the full chat mgs */ 
        socket.on('chat message', function(msg)
        {

        	var datetime = getDateTime();
        	//var fullmsg = socket.nickname + " : " + msg + " : " + datetime;
        	var m = new Array();
        	m.push(socket.nickname);
            m.push(msg);
            m.push(datetime);
        	insertChat(socket.nickname, msg);
          io.emit('chat message', m);
        });





        /* Entry of the new User in the chat room */ 
         socket.on('joinchat', function(usrname)
            {
            	socket.nickname = usrname;
            	console.log(usrname + ' has joined');
            	usersonline.push(usrname);
            	io.sockets.emit('onuserjoined' , usrname + ' has joined' );
            	io.sockets.emit('updatelist' , usersonline);
            	
          	   var msgs = new Array();
            	db.all("SELECT * FROM chatData", function(err, rows)
            	{
            		rows.forEach(function(row) 
                {
                		var m = new Array();
                		m.push(row.Name);
                		m.push(row.Msg);
                		m.push(row.TDValue);
            			//var m = row.Name + " : " + row.Msg + " @ " + row.TDValue;
            			msgs.push(m);			
            	  });

            		socket.emit('chathistory', msgs);
              });

            });


            /* users Exits */
            socket.on('disconnect', function() 
            {
            	console.log(socket.nickname + ' has left');
            	var indx = usersonline.indexOf(socket.nickname);
            	usersonline.splice(indx, 1);
            	io.sockets.emit('updatelist' , usersonline);
            	io.sockets.emit('onuserleft' , socket.nickname + ' has left' );
            });

  });




http.listen(3000, function()
{
  console.log('listening on *:3000');
});