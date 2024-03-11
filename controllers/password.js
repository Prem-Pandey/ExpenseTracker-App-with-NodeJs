require('dotenv').config();

const path = require('path');

const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');
const sequelize = require('../util/database'); 

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;

exports.getForgotPassword = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'forgotPassword.html'));
}

exports.postForgotPassword = async (req, res) => {
    const host = req.headers.origin;
    const ReceiverEmail = req.body.email;
    if(!ReceiverEmail){
        res.status(400).json({msg: 'Email is required'});
        return;
    }

    const t = await sequelize.transaction();

    try{
        const user = await User.findOne({where: {email: ReceiverEmail}});
        if(!user){
            res.status(400).json({msg: 'Email is not registered'});
            return;
        }

        const id = uuid.v4();
        console.log("............................."+id)
        await ForgotPassword.create({
            id,
            isActive: true,
            userId: user.id
        }
        , {transaction: t});
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        const tranEmailApi = new Sib.TransactionalEmailsApi();
        console.log("aaaaaaaaaaaaaaaaaaaaa"+tranEmailApi)
        const sender = { email: process.env.SIB_SENDER_EMAIL };
        const receivers = [{ email: ReceiverEmail }];
        console.log("sender: "+sender);
        console.log("reciever: "+receivers)

        const result = await tranEmailApi.sendTransacEmail({
            sender: sender,
            to: receivers,
            subject: 'Password reset link',
            htmlContent: `
                <a href="${host}/password/reset-password/${id}" target="_blank">
                    Click here to reset password
                </a>
            `
        }, {transaction: t});
       
        if(!result){
            res.status(500).json({msg: 'Could not send password reset link'});
            return;
        }
        await t.commit();
        res.status(200).json({msg: 'Password reset link sent to your email'});
    }catch(err){
        console.error('Error sending email:', err);
        console.log('POST FORGOT PASSWORD ERROR');
        await t.rollback();
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}

