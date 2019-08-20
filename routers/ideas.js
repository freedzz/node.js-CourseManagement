//引入express
const express = require('express');

//引入数据库
var mongoose = require('mongoose');

//引入数据模型
require("../models/Idea");
const Idea = mongoose.model('ideas');

//实例化router
const router = express.Router();

//引入bodyparser解析数据
const bodyParser = require('body-parser')
//body-parser中间件，解析数据
var jsonParser = bodyParser.json();
var urlencodeParser = bodyParser.urlencoded({extended:false});


/* 路由守卫 */
const {ensureAuthenticated} = require('../helpers/auth')






/* 课程列表页面 */
router.get("/ideas",ensureAuthenticated,(req,res) =>{
	Idea.find({user:req.user.id})
	.sort({data:"desc"})
	.then(ideas =>{
		res.render('ideas/index',{
			ideas:ideas
		})
	})
	
})

/* 添加课程页面 */
router.get("/ideas/add",ensureAuthenticated,(req,res) =>{
	res.render('ideas/add')
})

/* 对添加课程页面传来的数据处理 */
router.post("/ideas",urlencodeParser,(req,res) =>{
	//对前端发来的数据进行判断
	let errors = [];
	//console.log(req.body)
	if(req.body.title == ''){
		errors.push({text:'请输入标题！'});
	}
	if(req.body.details == ''){
		errors.push({text:"请输入详情！"});
	}
	if(errors.length>0){
		res.render("ideas/add",{
			errors:errors,
			title:req.body.title,
			details:req.body.details,
			})
	}else{
		const newUser ={
			title:req.body.title,
			details:req.body.details,
			user:req.user.id
		}
		new Idea(newUser)
		.save()
		.then(idea =>{
			req.flash("success_msg","数据添加成功！")
			res.redirect('/ideas')
		})
	}
	
})

/* 编辑课程页面 */
router.get('/ideas/edit/:id',ensureAuthenticated,(req,res) =>{
	//通过ID在数据库中查找值
	Idea.findOne({
		_id:req.params.id
	})
	//把值传个编辑页面
	.then(idea =>{
		/* 判断编辑时是否是同一个用户 */
		if(idea.user != req.user.id){
			req.flash("error_msg","非法操作！");
			res.redirect("/ideas")
		}
		res.render('ideas/edit',{
			idea:idea
		});
	})
	
})

/* 得到编辑页面返回的值 */
router.put('/ideas/:id',urlencodeParser,(req,res) =>{
	Idea.findOne({
		_id:req.params.id
	})
	.then(idea =>{
		idea.title = req.body.title;
		idea.details = req.body.details;
		idea.save()
			.then(idea =>{
				req.flash("success_msg","数据编辑成功！")
				res.redirect('/ideas')
			})
	})
	
})

//删除指定的课程
router.delete('/ideas/:id',ensureAuthenticated,urlencodeParser,(req,res) =>{
	
	Idea.remove({
		_id:req.params.id
	})
	.then(() =>{
		req.flash("success_msg","数据删除成功！")
		res.redirect('/ideas')
	})
	
})


//设置为全局变量
module.exports = router;