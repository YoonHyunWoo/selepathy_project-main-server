const { route } = require('express/lib/application');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');

const con = mysql.createConnection({
    host: '데이터베이스 주소',
    user: 'root',
    password: 'password',
    database: 'database'
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
