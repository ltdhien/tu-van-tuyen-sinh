require("dotenv").config();
import { response } from "express";
import request from "request";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const ImageGetStarted = `https://bit.ly/get-started-chatbot-by-hien`

let callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v12.0/me/messages",
        "qs": { "access_token": ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

let getUserName = (sender_psid) => {
    // Send the HTTP request to the Messenger Platform
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${ACCESS_TOKEN}`,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body);
                let username = `${body.first_name} ${body.last_name}`;
                resolve(username);
            } else {
                console.error("Unable to send message:" + err);
                reject(err);
            }
        });
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response1 = {
                "text": `OK. Xin chào mừng bạn ${username} đến với tư vấn tuyển sinh trường Đại học Cần Thơ`
            }
            let response2 = sendGetStartedTemplate();
            //send message
            await callSendAPI(sender_psid, response1);

            //send generic template message
            await callSendAPI(sender_psid, response2);



            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let sendGetStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Xin chào bạn đến với tư vấn tuyển sinh của Hiền",
                    "subtitle": "Dưới đây là các lựa chọn của tư vấn",
                    "image_url": ImageGetStarted,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Điểm tuyển sinh",
                            "payload": "ADMISSION_SCORE",
                        },
                        {
                            "type": "postback",
                            "title": "Ngành tuyển sinh",
                            "payload": "MAJOR",
                        },
                        {
                            "type": "postback",
                            "title": "Chỉ tiêu",
                            "payload": "TARGET",
                        }
                    ],
                }]
            }
        }
    }
    return ``;
}

module.exports = {
    handleGetStarted: handleGetStarted,
    getUserName: getUserName,
}