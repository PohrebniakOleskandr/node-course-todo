const bcrypt = require('bcryptjs');

let pass = 'kozel123';

bcrypt.genSalt(10, (err, salt)=>{
  bcrypt.hash(pass,salt,(err,hash)=>{
    console.log(hash);
  })
});


bcrypt.genSalt(11, (err, salt)=>{
  bcrypt.hash(pass,salt,(err,hash)=>{
    console.log(hash);
  })
});


bcrypt.genSalt(12, (err, salt)=>{
  bcrypt.hash(pass,salt,(err,hash)=>{
    console.log(hash);
  })
});


let hashOne='$2a$10$rUalnUk0zjMmzklzx45NzuIexqg1qqAbNOF9gjc8ESsypkdt33Uda';
let hashTwo='$2a$11$GeDpKL3YeMzNbDzbL1jGr.V6BYcq5ecYN6ZcbDrrpff7KfTErSzbe';
let hashThree='$2a$12$CQYeNg0SuD.ZORFwE9/fOOb/skspJAr.Ptspy9g.pVDZc89H4difS';

bcrypt.compare(pass,hashOne,(err,res)=>{console.log(res)});
bcrypt.compare(pass,hashTwo,(err,res)=>{console.log(res)});
bcrypt.compare(pass,hashThree,(err,res)=>{console.log(res)});
