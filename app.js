//<-----------------------------------------기본설정 시작------------------------------------------------------>
//asdfasggfgit
const app = require('express')();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const fs = require('fs');
const DB = require('./DB.js');
console.log(DB.user);
const {
    use
} = require('express/lib/router');
const { json } = require('body-parser');
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
    if(err) throw err;
    console.log('Connected successfully');
});
//<----------------------------------데이터베이스 연결 끝  -------------------------------------------------------->

//<-------------------------------세션을 통한 자동로그인 시작 -------------------------------------------------->
app.get('/', (req, res) => {
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
        if (user[0] == undefined) {
            res.render('allowpwd.ejs',{
                pwd:`없는 아이디입니다.`
            });
        } else if (user[0].pwd == req.body.pwd) {
            req.session.logined = true;
            req.session.user_name = user[0].name;
            fs.readFile('views/fallpwd.ejs', (err,data)=>{ 
                console.log(data);
            res.render('logout.ejs', {
                id: user[0].name
            });
            })
        } else {
            req.session.count++;
            res.render('allowpwd.ejs',{
                pwd : `비밀번호를 ${req.session.count}회 틀렸습니다.`
            });}
    });

});
//<----------------------------------MySQL 로그인 끝 -------------------------------------------------------->

//<--------------------------------비밀번호 찾기 시작---------------------------------------------------->

app.get('/findpwd',(req,res)=>{
    res.render('findpwd.ejs');
});
app.post('/findpwd',(req,res)=>{
    con.query(`SELECT * FROM login WHERE id="${req.body.id}"`, (error,rows,fields)=>{
        var user = JSON.parse(JSON.stringify(rows));
        if(user[0]==undefined){
            console.log(user[0]);
            res.render('failpwd.ejs',{
                pwd : `아이디를 정확히 입력해주세요.`,
            })
        }else if(req.body.name==user[0].name){
            res.render('allowpwd', {
                pwd : `비밀번호는 ${user[0].pwd} 입니다.`
            })
        }else{
            res.render('failpwd.ejs', {
                pwd : `이름을 정확히 입력해주세요.`
            })
        }
    })
    
})

//<-=--------------------------------비밀번호 찾기 끝------------------------------------------------->

//<----------------------------------회원가입 시작 --------------------------------------------------------->
//INSERT into user (id,pwd,name) VALUES ('id','wwqq','이정범'); <== 회원가입 MySQL

app.post('/signup', (req, res) => {
    con.query(`INSERT into login (id,pwd,name) VALUES ('${req.body.id}','${req.body.pwd}','${req.body.name}')`,(error, rows, fields)=>{
        res.render('allowpwd.ejs',{
            pwd : `회원가입이 완료되었습니다!`
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
    console.log('listening Port');
});

//<----------------------------채팅페이지 로드 ----------------------->


app.get('/chating', (req, res) => {
    res.render('logout.ejs');    // index.ejs을 사용자에게 전달
})

io.on('connection', (socket) => {   //연결이 들어오면 실행되는 이벤트
    // socket 변수에는 실행 시점에 연결한 상대와 연결된 소켓의 객체가 들어있다.
    
    //socket.emit으로 현재 연결한 상대에게 신호를 보낼 수 있다.
    socket.emit('usercount', io.engine.clientsCount);

    // on 함수로 이벤트를 정의해 신호를 수신할 수 있다.
    socket.on('message', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.
        console.log('Message received: ' + msg);

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('message', msg);
    });
});
app.get('/js/socket.io.min.js', (req,res)=>{
    fs.readFile('js/socket.io.min.js.txt','utf8',(err,data)=>{
        res.end(data);
    })
})

app.get('/socket.io/:asd', (req,res)=>{
    fs.readFile('js/socket.io.min.js.txt','utf8',(err,data)=>{
        res.end(data);
    })
}) 