
var auth = require('basic-auth')
var session = require('express-session');
var User = require("../models").User;


function userAuth(req,res,next){
    const user = auth(req);
    if(user.name && user.pass){
        User.authenticate(user.name, user.pass, function(error,user){
            if(!user){
                console.log(error + "is the error")
                let err = new Error("Wrong email or password");
                err.status=401;
                return next(err)
            }else{
                req.session.name = user._id;
                return next();
            }
        })
    }else{
        let err = new Error("Email and Password required");
        err.status=401;
        return next(err)
    }

}

module.exports.userAuth = userAuth;