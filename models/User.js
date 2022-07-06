const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide name'],
        minlenght: 3,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'please provide valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'please provide password'],
        minlenght: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
})
UserSchema.pre('save', async function () {
    // console.log(this.modifiedPaths());
    // console.log(this.isModified('name'));
    // const salt = await bcrypt.genSalt(10)
    if(!this.isModified('password'))return;
    this.password = await bcrypt.hashSync(this.password, 10)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch;
}
module.exports = mongoose.model("User", UserSchema)