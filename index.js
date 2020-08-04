const express = require("express");
const mysql = require('mysql');
const crypto = require('crypto');
const app = express();

app.use(express.static(__dirname + "/dist"));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const mysql_setting = {
    host : 'localhost',
    user : 'dbuser',
    database: 'bottle_mail_db',
    password : 'DB_lec_2020'
}


app.post('/api/do-add-message', function(req, res){
    const name = req.body.name;
    const hash = crypto.createHash('md5').update(req.body.pass).digest('hex');
    const message = req.body.message;

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    connection.query('insert into messages(name, hash, message) values(?, ?, ?)',[name, hash, message],function(error,results,fields){
        console.log(error, results);
        if(error){
            res.send("error");
        }else{
            res.send("");
        }
    });
    connection.end();
});

app.post('/api/get-random-message', function(req, res){
    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    var id = 0;
    connection.query('select id, name, message, date, opened from messages where opened=0 order by rand() limit 1',function(error,results,fields){
        console.log(error, results);
        if(error){
            res.send("error");
        }else{
            if(results.length == 1){
                oepnMessage(results[0].id);
                res.send(results[0]);
            }else{
                res.send("empty");
            }
        }
    });
    connection.end();
});

function oepnMessage(id){
    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    connection.query('update messages set opened=1 where id = ?',[id] ,function(error,results,fields){
        console.log(error, results);
    });
    connection.end();
}

app.post('/api/get-messages-by-name', function(req, res){
    const name = req.body.name;
    const hash = crypto.createHash('md5').update(req.body.pass).digest('hex');

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    connection.query('select * from messages where name = ? and hash = ?',[name, hash] ,function(error,results,fields){
        console.log(error, results);
        if(error){
            res.send("error");
        }else{
            res.send(results.length >= 1 ? results : "empty");
        }
    });
    connection.end();
});

app.post('/api/delete-message', function(req, res){
    const name = req.body.name;
    const hash = crypto.createHash('md5').update(req.body.pass).digest('hex');

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    connection.query('delete from messages where id = ? and name = ? and hash = ?',[req.body.id, name, hash] ,function(error,results,fields){
        console.log(error, results);
        if(error){
            res.send("error");
        }else{
            res.send("");
        }
    });
    connection.end();
});

app.post('/api/resend-message', function(req, res){
    const name = req.body.name;
    const hash = crypto.createHash('md5').update(req.body.pass).digest('hex');

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();
    connection.query('update messages set opened=0 where id = ? and name = ? and hash = ?',[req.body.id, name, hash] ,function(error,results,fields){
        console.log(error, results);
        if(error){
            res.send("error");
        }else{
            res.send("");
        }
    });
    connection.end();
});

app.listen(80, () => console.log("Listening..."));