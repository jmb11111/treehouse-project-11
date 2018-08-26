
'use strict';

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var CourseSchema = new Schema({
	user: {type: Schema.ObjectId,
        ref: "User"
        },
	title: String,
	description: String,
    estimatedTime: String,
    materialsNeeded: String,
    reviews: [{type: Schema.ObjectId,
        ref: "Review"
        }
    ],
    steps: [
        {
          _id: {
            $oid: String,
          },
          stepNumber: Number,
          title: String,
          description: String,
        },
    ]
});

var ReviewSchema = new Schema({
    user:{type: Schema.Types.ObjectId,
        ref: "User"
        },
    rating: Number,
    review: String,
    postedOn: {
      $date: Date
    }
  })

var UserSchema = new Schema({
      fullName: {
          type:String,
          required: [true, "full name is required"]},
      emailAddress: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
      password: {
        type:String,
        required: [true, "password is required"]}
})

// authenticate input against database documents
UserSchema.statics.authenticate = function(email,password,callback) {
    User.findOne({ emailAddress: email})
        .exec(function (error, user) {
          if (error) {
            return callback(error);
          } else if ( !user ) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
          } 
          bcrypt.compare(password, user.password, function(error, result){
              if(result === true){
                  return (callback(null, user))
              }else{
                  return callback(error);
              }
          })
 
        });
  }

UserSchema.pre('save',function(next){
    let user = this;
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    })


});

var Review = mongoose.model("Review", ReviewSchema);
var User = mongoose.model("User", UserSchema);

var Course = mongoose.model("Course", CourseSchema);
module.exports.User = User;

module.exports.Course = Course;
module.exports.Review = Review;

