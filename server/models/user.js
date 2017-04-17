const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
  let token = jwt.sign({_id : user._id.toHexString(), access},'secret123')
    .toString();

  user.tokens.push({access,token});

  return user.save().then(() =>{
    return token;
  });
};

const User = mongoose.model('User',UserSchema);

module.exports = {User};
