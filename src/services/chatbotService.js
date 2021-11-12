require("dotenv").config();
import { response } from "express";
import request from "request";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const ImageGetStarted = `https://bit.ly/get-started-chatbot-by-hien`
const ImageUniversity1 = `https://bit.ly/hinh-anh-khu-1`
const ImageUniversity2 = `https://bit.ly/get-started-chatbot-by-hien`
const ImageUniversity3 = `https://bit.ly/hinh-anh-khu-3`
const ImageUniversity4 = `https://bit.ly/hinh-anh-khu-hoa-an`

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
                            "title": "ĐỊA CHỈ TRƯỜNG",
                            "payload": "ADDRESS",
                        },
                        {
                            "type": "postback",
                            "title": "LỰA CHỌN KHÁC",
                            "payload": "OTHERS",
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
                        "title": "ĐIỂM TUYỂN SINH ",
                        "subtitle": "Bạn có thể xem điểm trên website chúng tôi cung cấp dưới đây ",
                        "image_url": ImageGetStarted,
                        "buttons": [
                            {
                                "type": "web_url",
                                "title": "ĐIỂM TRÊN WEBSITE",
                                "url": "https://bit.ly/nganh-va-diem-tuyen-sinh2021",
                            },
                            {
                                "type": "postback",
                                "title": "QUAY LẠI BẮT ĐẦU",
                                "payload": "GET_STARTED",
                            }
                        ],
                    }
                ]
            }
        }
    }
    return response;
}



let handleSendAddress = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getAddressTemplate();
            //send message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getAddressTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "ĐỊA CHỈ KHU I",
                        "subtitle": "Số 411 Đường 30/4, P.Hưng Lợi, Q.Ninh Kiều, TP.Cần Thơ  ",
                        "image_url": ImageUniversity1,
                    },
                    {
                        "title": "ĐỊA CHỈ KHU II",
                        "subtitle": "Đường 3/2, P.Xuân Khánh, Q.Ninh Kiều, TP.Cần Thơ ",
                        "image_url": ImageUniversity2,
                    },
                    {
                        "title": "ĐỊA CHỈ KHU III",
                        "subtitle": "Số 1 Đường Lý Tự Trọng, Q.Ninh Kiều, TP.Cần Thơ ",
                        "image_url": ImageUniversity3,
                    },
                    {
                        "title": "ĐỊA CHỈ KHU HÒA AN",
                        "subtitle": "Số 554, Quốc lộ 61, ấp Hòa Đức, xã Hòa An, huyện Phụng Hiệp, tỉnh Hậu Giang ",
                        "image_url": ImageUniversity4,
                    }
                ]
            }
        }
    }
    return response;
}

let handleSendOthers = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getAddressTemplate();
            //send message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendAdmissionScore: handleSendAdmissionScore,
    handleSendOthers: handleSendOthers,
    handleSendAddress: handleSendAddress,
}