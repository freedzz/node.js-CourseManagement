//实现登录验证界面的local
const LocalStrategy  = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 使用数据模型
const User = mongoose.model('users');

module.exports = function(passport){
  passport.use(new LocalStrategy(
  {usernameField: 'email'}, 
  /* 密码验证 */
  (email, password, done) => {
    // Match user
    User.findOne({email:email})
	.then(user => {
      if(!user){
        return done(null, false, {message: '用户不存在！'});
      } 

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
			//console.log(user)
          return done(null, user);
        } else {
          return done(null, false, {message: '密码不正确！'});
        }
      })
    })
  }));

/* 把当前登录状态持久化 */
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}