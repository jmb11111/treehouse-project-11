'use strict';

var express = require("express");
var router = express.Router();
var Course = require("./models").Course;
var User = require("./models").User;
var Review = require("./models").Review;
var mid = require("./middleware")



//Routes for Courses//

// GET /courses
router.get("/courses", function (req, res, next) {
    Course.find({})
        .select("title")
        .exec(function (err, courses) {
            if (err) return next(err);
            res.json(courses);
        });
});

//params
router.param("courseID", function (req, res, next, id) {
    Course.findById(id)
        .populate({
            path: 'reviews',
            model: 'Review',
            populate: {
                path: 'user',
                select: "fullName",
                model: 'User'
            }
        }
        )
        .populate({
            path: 'user',
            select: "fullName",
            model: 'User'
        })
        .exec(function (err, doc) {
            if (err) return next(err);
            if (!doc) {
                err = new Error(id + " Not Found");
                err.status = 404;
                return next(err);
            }
            req.course = doc;
            return next();
        })
});

router.get("/courses/:courseID",mid.userAuth, function (req, res, next) {
    res.json(req.course);
});

// create a course

router.post('/courses', mid.userAuth, function (req, res, next) {
    var course = new Course(req.body);
    course.user = req.session.name;
    course.save(function (err, course) {
        if (err){ 
            return next(err);
        }else{
        res.status(201);
        res.location("/");
        return next()}
    });
});

// update a course

router.put("/courses/:courseID", mid.userAuth, function (req, res, next) {
    req.course.update({
        $set:
        {
            title: req.body.title,
            description: req.body.description,
            user: req.body.user,
            steps: req.body.steps
        }
    }
        , function (err, result) {
            if (err) return next(err);
            next()
        });
});

//review a course


router.post("/courses/:courseId/reviews", mid.userAuth, function (req, res, next) {
    var review = new Review(req.body);
    review.user = req.session.name;
    Course.findByIdAndUpdate(req.params.courseId,  { new: true }, function (err, course) {
        if (err) { return next(err)}
        else if (course.user.toString() !== req.session.name.toString()) {
            course.reviews.push(review._id)
            course.save(function(err, course){
                if(err) return (next(err))
            });
            review.save(function (err, review) {
                if (err) return next(err);
                res.location("/");
                res.status(201);
                next();
            });
        }
        else {
            let err = new Error("You can't review your own course silly!")
            res.status(401);
            return next(err);
        }
    })
});

// routes for users

router.get("/users", mid.userAuth, (req, res, next) => {
    User.find({
        _id: req.session.name
    }).exec(function (err, user) {
        if(err) {
            res.status(401);

            return next(err);
        }else
        res.json(user);
    })
});


router.post("/users", function (req, res, next) {
    var user = new User(req.body);
    user.save(function (err, user) {
        if (err) {
            res.sendStatus(400)
            return next(err);
        }else{
        res.location("/");
        res.status(201);
        next()
     } });
});



module.exports = router;
