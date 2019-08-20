//引入express
const express = require('express');

//引入数据库
var mongoose = require('mongoose');

//引入bodyparser解析数据
const bodyParser = require('body-parser')
//body-parser中间件，解析数据
var jsonParser = bodyParser.json();
var urlencodeParser = bodyParser.urlencoded({extended:false});

//实例化router
const router = express.Router();

//加载model
require('../models/User');
const User = mongoose.model('users')

//密码加密模块
const bcrypt = require('bcrypt');

//使用passport来实现登录和验证
const passport = require('passport')




//登录页面
router.get('/users/login',(req,res) =>{
	res.render('users/login')
})

router.post('/users/login',urlencodeParser,(req,res,next) =>{
	
	/* 跳转到另一个页面验证 */
	passport.authenticate('local',{
		successRedirect:'/ideas',        /* 验证成功跳转 */
		failureRedirect:'/users/login',/* 验证失败跳转 */
		failureFlash:true
		})(req,res,next)

/* 	//查询数据库
	User.findOne({email:req.body.email})
	.then((user) =>{
		if(!user){
			req.flash("error_msg","用户不存在");
			res.redirect("/users/login")
			return;
		}
		
		//密码验证
		bcrypt.compare(req.body.password,user.password,(err,isMatch) =>{
			if(err) throw err;
			if(isMatch){
				req.flash("success_msg","登录成功");
				res.redirect("/ideas");
			}else{
				req.flash("error_msg","密码错误");
				res.redirect("/users/login");
			}
		})
		
	}) */
		
})



//注册页面
router.get('/users/register',(req,res) =>{
	res.render('users/register')
})

//得到注册的数据
router.post('/users/register',urlencodeParser,(req,res) =>{
	let errors = []
	
	/* 判断用户输入的内容是否有误 */
	if(req.body.password != req.body.password2){
		errors.push({text:"两次密码不一致"})
	}
	if(req.body.password.length<4){
		errors.push({text:"密码长度不能小于4位"})
	}
	if(errors.length>0){
		res.render('users/register',{
			errors:errors,
			name:req.body.name,
			email:req.body.email,
			password:req.body.password,
			password2:req.body.password2,
		})
	}else{
		
		/* 判断邮箱是否注册 */
		User.findOne({
			email:req.body.email
		})
		.then((user) =>{
			if(user){
				req.flash("error_msg","邮箱已经存在，请更换邮箱注册！")
				res.redirect('/users/register');
			}else{
				/* 邮箱正确保存到数据库 */
				const newUser = new User({
					name:req.body.name,
					email:req.body.email,
					password:req.body.password,
				})
				/* 对密码进行加密 */
				bcrypt.genSalt(10,(err,salt) =>{
					bcrypt.hash(newUser.password,salt,(err,hash) =>{
						if(err) throw err;
						newUser.password = hash;
						
						/* 加密后保存到数据库 */
						newUser.save()
						.then((user) =>{
							req.flash("success_msg","账号注册成功")
							res.redirect("/users/login")
						})
						.catch((err) =>{
							req.flash("error_msg","账号注册失败")
							res.redirect("/users/register")
						})
					})
				})

			}
		})

	}
	
	
	
	
	
	
})


//注销用户
router.get("/users/logout",(req,res) =>{
	req.logout();
	req.flash("success","用户注销成功")
	res.redirect('/users/login')
})


module.exports = router;