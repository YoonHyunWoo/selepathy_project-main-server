//<-----------------------------------------기본설정 시작------------------------------------------------------>
const app = require('express')();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mail = require('./mail.js')
const DB = require('./DB.js');
const { swaggerUi, specs } = require("./swagger/swagger")

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

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
            req.session.dkdlel=user[0].id;
            req.session.pwd=user[0].pwd
            res.redirect('http://localhost:3001/chating');
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

let transporter = nodemailer.createTransport({
    // 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
    service: 'gmail',
    // host를 gmail로 설정
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      // Gmail 주소 입력, 'testmail@gmail.com'
      user: 'yjs88zerg@gmail.com',
      // Gmail 패스워드 입력
      pass: mail.pwd,
    },
  });


let authpass;

app.post('/auth',async (req,res)=>{
    var random = Math.floor(Math.random() * 1000) + 1;
    res.render('auth',{
        id:req.body.id
    })
    let info = await transporter.sendMail({
        // 보내는 곳의 이름과, 메일 주소를 입력
        from: `"YKL Team" <yjs88zerg@gmail.com>`,
        // 받는 곳의 메일 주소를 입
        to: req.body.id,
        // 보내는 메일의 제목을 입력
        subject: 'YKL 이메일 인증',
        // 보내는 메일의 내용을 입력
        // text: 일반 text로 작성된 내용
        // html: html로 작성된 내용
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <form action="http://localhost:3000/pass" method="POST">
                <input type="text" value = "${random}" name="random" style="display:none">
                <input type="text" value = "${req.body.id}" name="id" style="display:none">
                <input type="text" value = "${req.body.pwd}" name="pwd" style="display:none">
                <input type="text" value = "${req.body.name}" name="name" style="display:none">
                <button>인증하기</button>
            </form>
        </body>
        </html>`
      });
      authpass=random;
})

app.post('/pass',(req,res)=>{
    if(req.body.random==authpass){
        console.log('완료!')
        console.log(req.body.id)
        res.redirect('/')
    }
})