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
                "text": `Xin chào mừng bạn ${username} đến với tư vấn tuyển sinh trường Đại học Cần Thơ`
            }
            let response2 = getStartedTemplate();
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

let getStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Bạn cần tư vấn những gì?",
                    "subtitle": "Dưới đây là các lựa chọn cho bạn ",
                    "image_url": ImageGetStarted,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "ĐIỂM TUYỂN SINH",
                            "payload": "ADMISSION_SCORE",
                        },
                        {
                            "type": "postback",
                            "title": "NGÀNH TUYỂN SINH",
                            "payload": "MAJOR",
                        },
                        {
                            "type": "postback",
                            "title": "CƠ SỞ VẬT CHẤT",
                            "payload": "INFRASTRUCTURE",
                        },
                        {
                            "type": "postback",
                            "title": "THỜI GIAN ĐÀO TẠO",
                            "payload": "TRAINING",
                        },
                        // {
                        //     "type": "postback",
                        //     "title": "MÔN HỌC",
                        //     "payload": "SUBJECTS",
                        // },
                        // {
                        //     "type": "postback",
                        //     "title": "MẠNG XÃ HỘI",
                        //     "payload": "MEDIA",
                        // },
                        // {
                        //     "type": "postback",
                        //     "title": "HỆ THỐNG HỖ TRỢ",
                        //     "payload": "ONLINE_SYSTEM",
                        // },
                        {
                            "type": "postback",
                            "title": "ĐỊA CHỈ",
                            "payload": "ADDRESS",
                        }
                        
                    ],
                }]
            }
        }
    }
    return response;
}

let handleSendAdmissionScore = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getAdmissionScoreTemplate();
            //send message
            await callSendAPI(sender_psid, response1);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getAdmissionScoreTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Điểm tuyển sinh ",
                    "subtitle": "Bạn cần xem điểm của ngành nào? ",
                    "image_url": ImageGetStarted,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Ngành Công Nghệ Thông Tin",
                            "payload": "IT_SCORE",
                        },
                        
                        {
                            "type": "postback",
                            "title": "Ngành Công Nghệ Sinh Học",
                            "payload": "BIOTECHNOLOGY_SCORE",
                        }
                    ],
                    },
                    {
                        "title": "Ngành tuyển sinh",
                        "subtitle": "Bạn cần biết cụ thể những ngành nào? ",
                        "image_url": ImageGetStarted,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Ngành Công Nghệ Thông Tin",
                                "payload": "IT_SCORE",
                            },
                            {
                                "type": "postback",
                                "title": "Ngành Công Nghệ Sinh Học",
                                "payload": "BIOTECHNOLOGY_SCORE",
                            }
                            
                        ],
                    }, {
                        "title": "Chỉ tiêu",
                        "subtitle": "Bạn cần biết chỉ tiêu của ngành nào? ",
                        "image_url": ImageGetStarted,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Ngành Công Nghệ Thông Tin",
                                "payload": "IT_SCORE",
                            },
                            {
                                "type": "postback",
                                "title": "Ngành Công Nghệ Sinh Học",
                                "payload": "BIOTECHNOLOGY_SCORE",
                            }
                        ],
                    }
                ]
            }
        }
    }
    return response;
}

let handleSendMajor = (sender_psid) => {

}

let handleSendTarget = (sender_psid) => {

}
module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendAdmissionScore: handleSendAdmissionScore,
    handleSendMajor: handleSendMajor,
    handleSendTarget: handleSendTarget,
}