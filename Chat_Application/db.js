// Require the sqlite3 library. Use the 'verbose()'-flag to show stack traces while running queries.
var sqlite3     = require('sqlite3').verbose();
var fs          = require('fs');

// Setup database:
var dbFile = './database.db';
var dbExists = fs.existsSync(dbFile);

// If the database doesn't exist, create a new file:
if(!dbExists)
{
    fs.openSync(dbFile, 'w');
}

// Initialize the database:
var db = new sqlite3.Database(dbFile);

// Optional installation for newly created databases:
if(!dbExists)
{
    db.run('CREATE TABLE `chatData` (' +
    '`PerId` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,' +
    '`Name` TEXT NOT NULL,' +
    '`Msg` TEXT,' +
    '`TDValue` DATETIME DEFAULT CURRENT_TIMESTAMP,' +
    '`ChatID` INTEGER NOT NULL)');
}

// Insert some data using a statement:
var statement = db.prepare('INSERT INTO `chatData` (`Name`, `Msg`, `TDValue`, `ChatID`) ' +
'VALUES (?, ?, ?, ?)');
statement.run('Nisha', 'hey How are u', '2015-06-15 06:45:33', 101);
statement.finalize();

// Close the database:
db.close();