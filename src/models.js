
'use strict';

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var CourseSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
    description: {
        type: String,
        required: [true, "description is required"]
    },
    estimatedTime: String,
    materialsNeeded: String,
    reviews: [{
        type: Schema.ObjectId,
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
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    rating: {
        type: Number,
        min: 1, max: 5
    },
    review: String,
    postedOn: {
        date: {
            type: Date,
            default: Date.now
        }
    }
})

var UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "full name is required"]
    },
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
        type: String,
        required: [true, "password is required"]
    }
})

// authenticate input against database documents
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ emailAddress: email })
        .exec(function (error, user) {
            if (error) {
                return callback(error);
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            if (password === user.password) {
                return callback(null, user)
            } else {
                bcrypt.compare(password, user.password, function (error, result) {
                    if (result === true) {
                        return (callback(null, user))
                    } else {
                        return callback(error);
                    }
                })
            }
        });
}


UserSchema.pre('save', function (next) {
    let user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
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

