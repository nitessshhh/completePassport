var express = require('express');
var router = express.Router();
var userModel = require('./users')
const passport=require('passport');
const localStrategy =require('passport-local')
const path=require("path")
var multer = require('multer')
var postModel = require("./post");



passport.use(new localStrategy(userModel.authenticate()))
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var dts = new Date()
    var fn = Math.floor(Math.random()*100000) + dts.getTime() + path.extname(file.originalname)


    cb(null, fn)
  }
})

const upload = multer({ storage: storage , fileFilter:fileFilter })
router.post('/uploads',isLoggedIn ,upload.single('dp'), function (req, res, next) {

  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedin){

loggedin.image = req.file.filename
loggedin.save()
.then(function(){
  res.redirect("back")

})
  })
  })
  
  function fileFilter (req, file, cb) {
    if(file.mimetype==="image/jpg" || file.mimetype==="image/jpeg" || file.mimetype==="image/svg" || file.mimetype==="image/png" || file.mimetype==="image/webp"  ){
      cb(null, true)
  
    }else{
      cb(new Error('I don\'t have a clue!'), false)
      console.log("error")
    }
  
  
  }
  
/* GET home page. */
router.get('/',redirectToProfile, function(req, res, next) {
  res.render('index');
});

router.get('/profile',isLoggedIn , async function(req, res, next) {
var loggedinuser= await userModel.findOne({username:req.session.passport.user})
  .populate({
    path:'post',
  populate:{
    path:'user'
  }
  })
    
    res.render("profile",{user:loggedinuser  })
    
  

  });
 
    router.get('/feed',isLoggedIn ,function(req, res, next) {
      postModel.find()
      .populate('user')
       .then(function(post){
     res.render("feed",{post})
     //res.send(post)
      })
     
      });
   
  
  router.get('/users/profile/:id',isLoggedIn ,function(req, res, next) {
    userModel.findOne({_id:req.params.id})
    .populate({
      path:'post',
    populate:{
      path:'user'
    }
    })
  
    .then(function(userdets){
    
      res.render("profile",{user:userdets })
      
      
    })
    });
    // router.post('/post',isLoggedIn ,function(req, res, next) {
    //   userModel.findOne({username:req.session.passport.user})
    //   .then(function(loggedinuser){
    //     postModel.create({
    //       postdets:req.body.postdets,
    //       user:loggedinuser._id
    //     }).then(function(createdPost){
    //       loggedinuser.post.push(createdPost._id)
    //       loggedinuser.save()
    //       .then(function(){
    //         res.redirect("back")
    //       })

    //     })
      
    //   })
    //   });
    router.post('/post',isLoggedIn, async function(req, res, next ){
var loggedinuser = await userModel.findOne({username: req.session.passport.user})
var createdPost= await postModel.create({postdets:req.body.postdets , user: loggedinuser})
loggedinuser.post.push(createdPost)
await loggedinuser.save()
res.redirect('back')
    })



  router.get('/username/:username' ,function(req, res, next) {
    userModel.findOne({username:req.params.username})
    .then(function(found){
    
     if(found){
        res.json({found:true})
    }
      else{
        res.json({found:false})
   }
  
     })
    });
    router.get('/find/:username',isLoggedIn ,function(req, res, next) {
     var regexp = new RegExp("^"+ req.params.username);
     userModel.find({username: regexp})
     .limit(5)
     .skip(5*req.params.username)
     .then(function(alluser){
     // console.log(alluser)
      res.json({alluser})
      
     })
      });
    
    
  router.get('/likes/:id',isLoggedIn ,function(req, res, next) {
    userModel.findOne({_id:req.params.id})
    .then(function(user){
      var indexof = user.likes.indexOf(req.session.passport.user)
      if(indexof===-1){ 
        user.likes.push(req.session.passport.user)
      }else{
        user.likes.splice(indexof,1)
      }
      user.save()
      .then(function(){
        res.redirect("back")
      })

      })
    });
    router.get('/like/:id',isLoggedIn ,async function(req, res, next) {
  var loggedinuser  = await userModel.findOne({username:req.session.passport.user})
  var likedPost = await postModel.findOne({_id: req.params.id})
    
        if(likedPost.like.indexOf(loggedinuser._id)===-1){ 
          likedPost.like.push(loggedinuser)
        }else{
          likedPost.like.splice(likedPost.like.indexOf(loggedinuser), 1)
        }
      await likedPost.save()
        
          res.redirect("back")
      
  
        
      });
   
router.post('/register', function(req, res, next) {
  var createdUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    image: req.body.image,

  })
  userModel.register(createdUser, req.body.password)
  .then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile')
    })
    
  })
});

router.post('/login', passport.authenticate('local',
{
  successRedirect: '/profile',
  failureRedirect: '/'

}), function(req, res, next){ })


router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/')
  }
}
function redirectToProfile(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/profile')
   
  }else{
    return next();
  }
}

module.exports = router;
