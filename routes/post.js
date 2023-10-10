var mongoose = require('mongoose');
var postSchema = mongoose.Schema({
    postdets:String,
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
},
    
    like:[{
        type:mongoose.Schema.Types.ObjectId,
         ref:"user"
            },
],
            Date:{
                type:Date,
                default:Date.now
            }
    
    
})

module.exports = mongoose.model('post', postSchema);
