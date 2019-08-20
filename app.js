//引入express
const express = require('express');

//实例化express
const app = new express();

//引入bodyparser解析数据
const bodyParser = require('body-parser')

//引入handlebar框架
const  exphbs = require('express-handlebars');

//引入method-override插件，改变添加新的put方法提交编辑的数据
const methodOverride = require('method-override')

//引入passport,实现用户登录的持续化
const passport = require("passport");

//引入session和flash插件，用于在redirect时发送错误信息
const session = require('express-session');
const flash = require('connect-flash');

//引入数据库
const mongoose = require('mongoose');


//引入数据模型
//可以在当前页面使用idea来进行数据库操作
require("./models/Idea");
const Idea = mongoose.model('ideas');

//引入外部文件
//引入之后还要使用
//app.use('/',ideas)
//app.use("/",users)
const ideas = require('./routers/ideas.js')
const users = require('./routers/users.js')

//设置静态文件访问
const path = require('path')


//body-parser中间件，解析数据
var jsonParser = bodyParser.json();
var urlencodeParser = bodyParser.urlencoded({extended:false});

//handlebar使用中间件
app.engine('handlebars',exphbs({
	defaultLayout:'main'
}));
app.set('view engine','handlebars');

//引入method-override插件，使用中间件使用插件
app.use(methodOverride('_method'))

//连接数据库
var db = require("./config/mongodb")
//var url = 'mongodb://localhost:27017/course';
mongoose.connect(db.mongoURL)
.then(()=>{
	console.log("mongodb connected....");
})
.catch(err =>{
	console.log(err);
})


//使用passport引入外部文件
require("./config/passport")(passport)


//使用session和flash，用于保存数据
//用于在redirect的时候向redirect的页面
//传递一个带值的参数用于提示用户
//要放在路由之前
app.use(session({
	secret:'secret',
	resave:true,
	saveUninitialized:true,
}));
app.use(flash());

//passport所依赖的一个模块实现用户登录可以注销
//要放在路由前面
//配置全局变量的后面
app.use(passport.initialize());
app.use(passport.session());



//配置全局变量
app.use((req,res,next) =>{
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	/* 登录验证时返回来的错误报告 */
	res.locals.error = req.flash('error')
	/* 接受登录成功时返回的用户 */
	res.locals.user = req.user || null;
	//console.log(res.locals.user)
	next();
})

//使用router
//引入外部文件之后要使用
//要放在session和flash之后
app.use('/',ideas)
app.use("/",users)


/* 设置服务器访问静态文件 */
app.use(express.static(path.join(__dirname,'public')))




/* 主页页面 */
app.get("/",(req,res) =>{
	const title = "欢迎来到课程中心！"
	res.render('index',{
		title:title
	})
})

/* 关于我们页面 */
app.get("/about",(req,res) =>{
	res.render('about')
})


//监听端口
const port = process.env.PORT ||8080;

app.listen(port,"localhost",() =>{
	console.log("服务器正在运行中.........")
});