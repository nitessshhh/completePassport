var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');
const { post } = require('.');
mongoose.connect("mongodb://127.0.0.1:27017/passport");
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    image:{
        type:String,
        default:"download.jpeg"
    },
    likes:{
        type:Array,
         default:[]
            },

            post:[{
                type:mongoose.Schema.Types.ObjectId,
                ref:"post"
            }]

            
    
    
})
userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);
