const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password:{
    type: String,
    require: true,
    min: 6
  },
  profilePicture:{
    type: String,
    default:""
  },
  coverPicture:{
    type: String,
    default:""
  },
  followers:{
    type:Array,
    default:[]
  },
  following:{
    type:Array,
    default:[]
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  desc:{
    type:String,
    max:50
  },
  city:{
    type:String,
    max:50
  } ,
  from:{
    type:String,
    max:50
  },
  relationship:{
    type:Number,
    enum:[1,2,3]
  }

},
{timestamps:true}
);
  

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.pre('findOneAndUpdate', async function () {
  const newPassword = this.getUpdate().$set.password
  if(newPassword!=undefined){
    const salt = await bcrypt.genSalt(10)
    this.getUpdate().$set.password = await bcrypt.hash(newPassword, salt)
 }
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, username: this.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
