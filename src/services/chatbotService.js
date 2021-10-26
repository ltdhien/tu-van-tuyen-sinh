require("dotenv").config();
import request from "request";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

let callSendAPI = (response) => {
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

let handleGetStarted = () => {
    return Promise(async (resolve, reject) => {
        try {
            let response = {
                "text": "OK. Xin chào mừng bạn ABC đến với tư vấn tuyển sinh trường Đại học Cần Thơ"
            }
            await this.callSendAPI(response);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    handleGetStarted:handleGetStarted,
}