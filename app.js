//<-----------------------------------------기본설정 시작------------------------------------------------------>
const app = require('express')();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const fs = require('fs');
const DB = require('./DB.js');
const {
    use
} = require('express/lib/router');
const {
    json
} = require('body-parser');
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({
    extended: false
}));
//<------------------------------------------기본설정 끝 ---------------------------------------->


// <------------------------------- 데이터베이스 연결 시작 ------------------------------------------------------->
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));
const con = mysql.createConnection({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    database: DB.database
});

con.connect((err) => {
    if (err) throw err;
    console.log('Connected successfully');
});
//<----------------------------------데이터베이스 연결 끝  -------------------------------------------------------->

//<-------------------------------세션을 통한 자동로그인 시작 -------------------------------------------------->
app.get('/', (req, res) => {
    if (req.session.logined) {
        res.redirect('http://localhost:3001/chating');
        console.log(req.session);
    } else {
        console.log(req.session);

        res.render('login.ejs', {
            id: " "
        });

    }
});


//<-------------------------------세션을 통한 자동로그인 끝-------------------------------------------------->

//<-------------------------------회원가입 페이지 로드 시작 ----------------------------------------->

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

//<-----------------------------------회원가입 페이지 로드 끝 --------------------------------->

//<-------------------------------MySQL 로그인 시작 ----------------------------------------------------------->
app.post('/', (req, res) => {
    con.query(`SELECT * FROM login WHERE id="${req.body.id}"`, (error, rows, fields) => {
        var user = JSON.parse(JSON.stringify(rows));
        if (user[0] == undefined) {
            res.render('allowpwd.ejs', {
                pwd: `없는 아이디입니다.`
            });
        } else if (user[0].pwd == req.body.pwd) {
            req.session.logined = true;
            req.session.user_name = user[0].name;
            fs.readFile('views/fallpwd.ejs', (err, data) => {
                console.log(data);
                res.redirect('http://localhost:3001/chating');
            })
        } else {
            req.session.count++;
            res.render('allowpwd.ejs', {
                pwd: `비밀번호를 ${req.session.count}회 틀렸습니다.`
            });
        }
    });

});
//<----------------------------------MySQL 로그인 끝 -------------------------------------------------------->

//<--------------------------------비밀번호 찾기 시작---------------------------------------------------->

app.get('/findpwd', (req, res) => {
    res.render('findpwd.ejs');
});
app.post('/findpwd', (req, res) => {
    con.query(`SELECT * FROM login WHERE id="${req.body.id}"`, (error, rows, fields) => {
        var user = JSON.parse(JSON.stringify(rows));
        if (user[0] == undefined) {
            console.log(user[0]);
            res.render('failpwd.ejs', {
                pwd: `아이디를 정확히 입력해주세요.`,
            })
        } else if (req.body.name == user[0].name) {
            res.render('allowpwd', {
                pwd: `비밀번호는 ${user[0].pwd} 입니다.`
            })
        } else {
            res.render('failpwd.ejs', {
                pwd: `이름을 정확히 입력해주세요.`
            })
        }
    })

})

//<-=--------------------------------비밀번호 찾기 끝------------------------------------------------->

//<----------------------------------회원가입 시작 --------------------------------------------------------->
//INSERT into user (id,pwd,name) VALUES ('id','wwqq','이정범'); <== 회원가입 MySQL

app.post('/signup', (req, res) => {
    con.query(`INSERT into login (id,pwd,name) VALUES ('${req.body.id}','${req.body.pwd}','${req.body.name}')`, (error, rows, fields) => {
        res.render('allowpwd.ejs', {
            pwd: `회원가입이 완료되었습니다!`
        });
    });
})

//<----------------------------------회원가입 끝 --------------------------------------------------------->

//<---------------------------------------------로그아웃 시작---------------------------------------------------->
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
// <--------------------------------------------------로그아웃 끝 ------------------------------------------->
app.listen(3000, () => {
    console.log('listening 80Port');
});