const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlenth: 6,
    unique: true,
    validate:{
      validator: validator.isEmail,
      message: '{VALUE is not a valid e-mail}'
    }
  },
  password: {
    type: String,
    require: true,
    minlenth: 6,
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});


UserSchema.methods.toJSON = function(){
  let user = this;
  return _.pick(user.toObject(),'_id','email');
};


UserSchema.methods.generateAuthToken = function(){
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id : user._id.toHexString(), access},process.env.JWT_SECRET)
    .toString();

  user.tokens.push({access,token});

  return user.save().then(() =>{
    return token;
  });
};



UserSchema.methods.removeToken = function(token){
  let user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};


UserSchema.statics.findByToken = function(token) {

  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token,process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }


  return User.findOne({
    '_id' : decoded._id,
    'tokens.token' : token,
    'tokens.access' : 'auth'
  });
}


UserSchema.statics.findByCredentionals = function(email,password) {

  let User = this;

  return User
  .findOne({email})
  .then(user => {
      if(!user) return Promise.reject();
      return bcrypt.compare(password,user.password)
            .then((res) => {
              if (res) return user;
              else return Promise.reject();
            });
   });
}

UserSchema.pre('save',function(next){
  let user = this;

  if (user.isModified('password')) {
    let notDecodedPassword = user.password;
    bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(notDecodedPassword,salt,(err,hash)=>{
        user.password = hash;
        next();
      })
    });
  }
  else{
    next();
  }
});



const User = mongoose.model('User',UserSchema);

module.exports = {User};
