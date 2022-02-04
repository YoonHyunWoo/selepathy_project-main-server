//<-----------------------------------------기본설정 시작------------------------------------------------------>
const app = require('express')();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const {
    use
} = require('express/lib/router');
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({
    extended: false
}));
let i = 0;
//<------------------------------------------기본설정 끝 ---------------------------------------->


// <------------------------------- 데이터베이스 연결 시작 ------------------------------------------------------->
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'login'
});

con.connect((err) => {
    if(err) throw err;
    console.log('Connected successfully');
});
//<----------------------------------데이터베이스 연결 끝  -------------------------------------------------------->

//<-------------------------------세션을 통한 자동로그인 시작 -------------------------------------------------->
app.get('/', (req, res) => {
    req.session.count=0;
    if (req.session.logined) {
        res.render('logout.ejs', {
            id: req.session.user_id
        });
        console.log(req.session);
    } else {
        console.log(req.session);
        res.render('login.ejs',{
            id:" "
        });
    }
});


//<-------------------------------세션을 통한 자동로그인 끝-------------------------------------------------->

//<-------------------------------회원가입 페이지 로드 시작 ----------------------------------------->

app.get('/signup',(req,res)=>{  
    res.render('signup.ejs');
})

//<-----------------------------------회원가입 페이지 로드 끝 --------------------------------->

//<-------------------------------MySQL 로그인 시작 ----------------------------------------------------------->
app.post('/', (req, res) => {
    con.query(`SELECT * FROM login WHERE id="${req.body.id}"`, (error, rows, fields) => {
        var user = JSON.parse(JSON.stringify(rows));
        if(req.body.id==""){
            res.render('login.ejs',{
                id:`아이디를 입력해주세요!`
            });
        }else if (user[0] == undefined) {
            req.session.count++;
            res.render('login.ejs',{
                id:`아이디를 ${req.session.count}회 틀렸습니다!`
            });
        } else if (user[0].pwd == req.body.pwd) {
            req.session.logined = true;
            req.session.user_name = user[0].name;
            res.render('logout.ejs', {
                id: user[0].name
            });
        } else {
            console.log("password가 틀립니다!");
        }
    });

});
//<----------------------------------MySQL 로그인 끝 -------------------------------------------------------->

//<----------------------------------회원가입 시작 --------------------------------------------------------->
//INSERT into user (id,pwd,name) VALUES ('id','wwqq','이정범'); <== 회원가입 MySQL

app.post('/signup', (req, res) => {
    con.query(`INSERT into login (id,pwd,name) VALUES ('${req.body.id}','${req.body.pwd}','${req.body.name}')`,(error, rows, fields)=>{
        res.redirect('/');
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
    console.log('listening 3000Port');
});