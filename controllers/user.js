const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// function generateAccessToken(id){
//     return jwt.sign({userId: id}, process.env.TOKEN_SECRET);
// }
function generateAccessToken(id, name, isPremiumUser){
    return jwt.sign({userId: id, username: name, isPremiumUser}, process.env.TOKEN_SECRET);
}

exports.generateAccessToken = generateAccessToken;

exports.getSignup = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
};

exports.postSignup = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if(!username || !email || !password){
        res.status(400).json({ msg: 'All fields are required' });
        return;
    }

    try{
        const hash = await bcrypt.hash(password, 10); // 10 salt rounds
        const user = await User.create({
            username: username,
            email: email,
            password: hash,
            balance: 0,
            isPremiumUser: false
        });
        res.status(201).json({ userData: user, msg: 'User added successfuly' });
    }catch(err){
        console.log('POST USER SIGNIN ERROR');
        if(err.name === 'SequelizeUniqueConstraintError'){
            res.status(400).json({ error: err, msg: 'Email is already registered' });
            return;
        }
        res.status(500).json({ error: err, msg: 'Could not add user' });
    }
};

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
};

exports.postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password){
        res.status(400).json({ msg: 'All fields are required' });
        return;
    }
    
    try{
        const user = await User.findOne({ where: { email: email } });
        console.log("user emil>>>>>"+email)
        if(!user){

            res.status(404).json({ msg: 'Email not registered' });
            return;
        }
        
        // const hash = user.password;
        // const match = await bcrypt.compare(password, hash);
        // const existingUser = await User.findOne({
        //     where: {
        //       email,
        //     },
        //   });
    
    if (user) {
            const match = await bcrypt.compare(password, user.password);
            console.log("password+ "+password + "  >>user.password: "+ user.password)
        if(match){
            console.log("after match>>>>>>>>>>>>")
            res.status(200).json({ 
                msg: 'User logged in successfully', 
                token: generateAccessToken(user.id, user.username, user.isPremiumUser) 
            });
            return;
        }else{
            res.status(401).json({ msg: 'Incorrect Password' });
        }
    }
    }catch(err){
        console.log('POST USER LOGIN ERROR');
        res.status(500).json({ error: err, msg: 'Could not fetch user' });
    }
};