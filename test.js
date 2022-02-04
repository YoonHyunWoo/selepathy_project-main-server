const { route } = require('express/lib/application');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');

const con = mysql.createConnection({
    host: 'db-yhw.cs7crgxlvnm1.us-west-2.rds.amazonaws.com',
    user: 'root',
    password: 'a88310027',
    database: 'login'
});

con.connect((err) => {
    if(err) throw err;
    console.log('Connected successfully');
});
con.query(`SELECT * FROM user WHERE id="hello"`, (error, rows, fields)=>{
    var user = JSON.parse(JSON.stringify(rows));
    console.log(user[0].pwd);
});

con.end();
