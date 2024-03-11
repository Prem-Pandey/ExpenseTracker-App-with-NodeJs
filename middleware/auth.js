const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    console.log("token in auth: "+ token);
    console.log("decret code: "+process.env.TOKEN_SECRET);
    const user = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET);
    console.log("token in auth 2: "+ token);
    console.log("decret code 2: "+process.env.TOKEN_SECRET);
    User.findByPk(user.userId)
    .then((user) => {
        req.user = user;
        next();
    })
    .catch((err) => res.status(500).json({msg: 'Could not fetch user'}));
};

exports.isPremiumUser = (req, res, next) => {
    const token = req.headers.authorization;
    console.log("token in auth: "+ token);
    console.log("decret code: "+process.env.TOKEN_SECRET);
    const user = jwt.verify(token, process.env.TOKEN_SECRET);

    console.log("token in auth 1: "+ token);
    console.log("decret code 1: "+process.env.TOKEN_SECRET)
    User.findByPk(user.userId)
    .then((user) => {
        req.user = user;
        if(user.isPremiumUser === true){
            next();
        }else{
            return res.status(403).json({msg: 'You are not a premium user'});
        }
    })
    .catch((err) => res.status(500).json({msg: 'Could not fetch user'}));
};