var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



var dbConnect = 'mongodb+srv://admin:admin@cluster0.bpekq.mongodb.net/tinder1?retryWrites=true&w=majority';
const mongoose = require('mongoose');
mongoose.connect(dbConnect, {useNewUrlParser: true, useUnifiedTopology:true});

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    var chuoi=file.originalname;
    var duoi=file.originalname.slice(chuoi.length-4,chuoi.length);
    if(duoi=='.jpg'){
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+duoi)
    }else {
      cb('khong phải file jpg',null)
    }
  }
})


var upload=multer({
  storage:storage,
}).single('avartar')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (){
  console.log('connected');
})
var user = new mongoose.Schema({
  username: String,
  date: String,
  mail_sdt: String,
  sex: String,
  introduce_yourself: String,
  avartar : String,
})
router.get('/login',function (req,res){
  var userConnect = db.model('users', user);
  userConnect.find({}, function (error, users){
    var type = '';
    try {
      type = req.query.type;
    } catch (e) {
    }
    if (error) {
      res.render('login', {title: 'login : ' + error});
      return
    }
    //http://localhost:3000/?type=json
    if (type == 'json') {
      res.send(users)
    } else {
      res.render('login', {title: 'login', users: users});
    }
  })
})
router.post('/login', function (req,res){
  var userConnect = db.model('users', user);
  upload(req,res,function (err){
    if(err){
      console.log(err)
      return;
    }else {
      userConnect( {
        username: req.body.username,
        date: req.body.date,
        mail_sdt: req.body.mail_sdt,
        sex : req.body.sex,
        introduce_yourself: req.body.introduce_yourself,
        avartar: req.file.filename,
    }).save(function (err){
      if(err){
        res.render('login',{title:'error'})
      }else {
        var userConnect1 = db.model('users', user);
        userConnect1.find({},function (err,users){
          if(err){
            res.render('login',{title:'Express :err'+err})
          }
          // res.render('login',{title:'Express :Success',users:users})
          res.redirect('../login');
        })
      }
      })
    }
  });
})
router.get('/deleteUsers/:id',function (req,res) {

  db.model('users',user).deleteOne({ _id: req.params.id}, function (err) {
    if (err) {
      console.log('Lỗi')
    }

    res.redirect('../login')

  });
})
router.get('/updateUser/:id',function (req,res) {
  console.log('id:'+req.params.id)
  db.model('users',user).findById(req.params.id,function (err,data) {
    if(err){
      console.log("loi")
    }else {
      res.render("updateUser",{dulieu: data})

    }
  })
})
router.post('/updateUser',function (req,res) {
  var userConnect=db.model('users',user);
  console.log('name:'+req.body._id)

  upload(req, res, function (err){
    if(err){
      console.log(err)

    }else {
      if(!req.file){
        console.log('name:'+req.body.usernameUD)
        userConnect.updateOne(req.body._id,{
          username: req.body.usernameUD,
          date: req.body.dateUD,
          mail_sdt: req.body.mail_sdtUD,
          sex : req.body.sex,
          introduce_yourself: req.body.introduce_yourselfUD,
        },function (err) {
          if(err){
            console.log(err)
          }else {
            res.redirect('../login')
          }
        }  )
      }else {

        console.log('name2:'+req.body.usernameUD)
        userConnect.updateOne(req.body._id,{
          username: req.body.usernameUD,
          date: req.body.dateUD,
          mail_sdt: req.body.mail_sdtUD,
          sex : req.body.sex,
          introduce_yourself: req.body.introduce_yourselfUD,
          avartar: req.file.filename,
        },function (err) {
          if(err){
            console.log(err)
          }else {
            res.redirect('../login')
          }
        }  )
      }
    }

  });



})

module.exports = router;


