import nodemailer from "nodemailer";
import 'dotenv/config';
import { text } from "express";

export const verifyemail =(token, email)=>{
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
     const mailconfiguration ={
     from: process.env.MAIL_USER,
     to: email,
     subject: 'Email Verification for Ekart',
     text: 'hi! there, you have recently visited our website ekart and entered your email id. please click on the link below to verify your email address http://localhost:3000/verifyemail/${token} thanks '
};
transporter.sendMail(mailconfiguration, function(error, info){
    if (error) throw (error)
     console.log('Email sent successfully: ');
     console.log(info);
});
}

