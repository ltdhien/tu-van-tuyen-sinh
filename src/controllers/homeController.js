require("dotenv").config();
import request from "request"
//import chatbotService from "../services/chatbotService"
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const ImageMainContent = `https://bit.ly/get-started-chatbot-by-hien`

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

let postWebhook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}


let getFacebookUsername = (sender_psid) => {
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

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    //Get payload for Postback
    let payload = received_postback.payload;

    //Set the response based on the postback payload
    await markMessageSeen(sender_psid);
    switch (payload) {
        case "GET_STARTED":
        case "RESTART_CONVERSATION":
            await sendWelcomeNewClient(sender_psid);
            break;
        case "MAIN_CONTENT":
            await sendMainContent(sender_psid);
            break;
        case "REGISTER_ADMISSIONS":
            await sendRegisterAdmissions(sender_psid);
            break;
        case "MAJORS":
            await sendMajor(sender_psid);
            break;
        case "RECRUITMENT_METHOD":
            await sendRecruitmentMethod(sender_psid);
            break;
        case "GO_BACK_RECRUITMENT_METHOD":
            await goBackRecruitmentMethod(sender_psid);
        case "COMPARE":
            await sendCompare(sender_psid);
            break;
        case "SCHOLARSHIP_POLICY":
            await sendScholarshipPolicy(sender_psid);
            break;
        default:
            response = { "text": `Opp! I don't know response with postback ${payload}` }
    }
}


let setupProfile = async (req, res) => {
    // call profile facebook api
    let request_body = {
        "get_started": { "payload": "GET_STARTED" },
        "whitelisted_domains": ["https://test-app-tvts-in-heroku.herokuapp.com/"]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${ACCESS_TOKEN}`,
        "qs": { "access_token": ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            console.log('Setup user profile succeeds ')
        } else {
            console.error("Unable to Setup user profile:" + err);
        }
    });

    return res.send("Setup user profile succeeds");

}

let setupPersistentMenu = async (req, res) => {
    // call profile facebook api
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Khởi động lại bot",
                        "payload": "RESTART_CONVERSATION"
                    },
                    {
                        "type": "web_url",
                        "title": "Web site trường",
                        "url": "https://ctu.edu.vn/",
                        "webview_height_ratio": "full"
                    }
                ]
            }
        ]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${ACCESS_TOKEN}`,
        "qs": { "access_token": ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            console.log('Setup persistent menu succeeds! ')
        } else {
            console.error("Unable to Setup user profile:" + err);
        }
    });

    return res.send("Setup persistent menu succeeds!");
}


let sendWelcomeNewClient = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getFacebookUsername(sender_psid);
            let response1 = {
                "text": `Xin chào bạn ${username}. Mình là Chatbot tư vấn tuyển sinh của trường Đại học Cần Thơ. Bạn có thể hỏi mình bằng cách chọn "Câu hỏi" ở dưới`
            }
            let response2 = sendMainContent(sender_psid);
            //send welcome message
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response1);
            //send button view main content
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response2);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
};

let sendMainContent = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Đăng ký xét tuyển",
                        "subtitle": "Bạn có đang thắc mắc về việc đăng ký xét tuyển ở trường CTU?",
                        "image_url": ImageMainContent,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Đăng ký xét tuyển",
                                "payload": "REGISTER_ADMISSIONS"
                            }
                        ]
                    },
                    {
                        "title": "Phương thức tuyển sinh",
                        "subtitle": "Bạn có phải đang không biết phương thức tuyển sinh đầu vào lần này như thế nào?",
                        "image_url": ImageMainContent,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Ngành tuyển sinh",
                                "payload": "MAJORS"
                            }
                        ]
                    },
                    {
                        "title": "Phương thức tuyển sinh",
                        "subtitle": "Bạn có phải đang không biết phương thức tuyển sinh đầu vào lần này như thế nào?",
                        "image_url": ImageMainContent,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Phương thức tuyển sinh",
                                "payload": "RECRUITMENT_METHOD"
                            }
                        ]
                    },
                    {
                        "title": "Câu hỏi khác",
                        "subtitle": "Chương trình chất lượng cao khác gì so với chương trình đại trà?",
                        "image_url": ImageMainContent,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Chi tiết",
                                "payload": "COMPARE"
                            }
                        ]
                    },
                    {
                        "title": "Câu hỏi khác",
                        "subtitle": "Chính sách học bổng của trường như thế nào?",
                        "image_url": ImageMainContent,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Chi tiết",
                                "payload": "SCHOLARSHIP_POLICY"
                            }
                        ]
                    }
                ]
            }
        }
    }
    return response;
}

let sendRegisterAdmissions = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": `Mỗi thí sinh được quyền đăng ký xét tuyển vào Trường bằng nhiều phương thức khác nhau, mỗi phương thức nộp 01 bộ hồ sơ riêng và không có sự ràng buộc nào giữa những nguyện vọng do thí sinh đăng ký trong các phương thức.
				Trường hợp đăng ký nhiều phương thức cùng trường hoặc khác trường (trong đó có phương thức 2): khi trúng tuyển và xác nhận nhập học trước khi phương thức 2 công bố kết quả thì thí sinh không được xét tuyển theo phương thức 2 nữa; ngược lại, nếu không trúng tuyển hoặc chưa xác nhận nhập học thì vẫn được xét tuyển ở phương thức 2.
				Nếu một phương thức có nhiều đợt xét tuyển thì điểm trúng tuyển của đợt sau không được thấp hơn điểm trúng tuyển của đợt xét tuyển trước.`,
            }
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Bạn có muốn giải đáp những câu hỏi khác?",
                                "subtitle": "Nhấn quay lại để có thể giải đáp những thắc mắc của bạn",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Quay lại",
                                        "payload": "MAIN_CONTENT"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response1);
            //send button view main content
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response2);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
}

let sendMajor = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {

            }

            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
}

let sendRecruitmentMethod = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Phương thức 1",
                                "subtitle": "Tuyển thẳng, ưu tiên xét tuyển",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/937-phuong-thuc-1.html"
                                    }
                                ]
                            },
                            {
                                "title": "Phương thức 2",
                                "subtitle": " Xét tuyển điểm Kỳ thi tốt nghiệp THPT",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/938-phuong-thuc-2.html"
                                    }
                                ]
                            },
                            {
                                "title": "Phương thức 3",
                                "subtitle": "Xét tuyển điểm học bạ THPT",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/939-phuong-th-c-3.html"
                                    }
                                ]
                            },
                            {
                                "title": "Phương thức 4",
                                "subtitle": "Xét tuyển vào ngành Sư phạm bằng điểm học bạ THPT",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/947-phuong-thuc-4.html"
                                    }
                                ]
                            },
                            {
                                "title": "Phương thức 5",
                                "subtitle": "Tuyển chọn vào chương trình tiên tiến và chất lượng cao",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/940-phuong-thuc-5.html"
                                    }
                                ]
                            },
                            {
                                "title": "Phương thức 6",
                                "subtitle": "Xét tuyển thẳng vào học Bồi dưỡng kiến thức",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/phuong-thuc-xet-tuyen/941-phuong-thuc-6.html",
                                    }
                                ]
                            },
                            {
                                "title": "Câu hỏi",
                                "subtitle": "Bạn đang thắc mắc những câu hỏi nào dưới đây?",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Quay lại",
                                        "payload": "MAIN_CONTENT"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }

            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
}

let sendCompare = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": `Cấu trúc chương trình đào tạo chất lượng cao gần giống với chương trình đào tạo của nước ngoài; Học bằng tiếng Anh; Có cơ hội đi thực tập ở nước ngoài; .... => cơ hội việc làm trong môi trường có yếu tố nước ngoài cao hơn.`
            }
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Thông tin chi tiết",
                                "subtitle": "Bạn có thể nhấn 'chi tiết' để tìm thêm thông tin hoặc quay lại",
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Chi tiết",
                                        "url": "https://tuyensinh.ctu.edu.vn/dai-hoc-chinh-quy/chuong-trinh-chat-luong-cao.html"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Quay lại",
                                        "payload": "MAIN_CONTENT"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
}

let sendScholarshipPolicy = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": `
				- Dành 3 tỉ đồng để cấp 1.000 suất học bổng (3.000.000đ/suất) cho tân sinh viên có điểm trúng tuyển cao.
				- Dành 100 suất học bổng (3.000.000 đ/suất) cho tân sinh viên Khu Hòa An.
				- 100 suất học bổng học tập ngắn hạn ở nước ngoài (30 suất cho các ngành chương trình tiên tiến và chương trình chất lượng cao).
				- Giảm 50% học phí năm thứ nhất cho nữ sinh trúng tuyển chương trình đào tạo đại trà các ngành: Kỹ thuật cơ khí, Kỹ thuật điện, Kỹ thuật cơ điện tử, Kỹ thuật điều khiển và tự động hóa.
				-Nhiều học bổng tài trợ từ cơ quan, doanh nghiệp cho tân sinh viên có hoàn cảnh khó khăn và điểm trúng tuyển cao.`
            }
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "image_url": ImageMainContent,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Quay lại",
                                        "payload": "MAIN_CONTENT"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            await sendTypingOn(sender_psid)
            await sendMessage(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    });
}

let goBackRecruitmentMethod = (sender_psid) => {
    sendRecruitmentMethod(sender_psid);
}

let sendMessage = (sender_psid, response) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response,
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v12.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                console.log(res)
                console.log(body)
                if (!err) {
                    console.log("message sent!");
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v12.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v12.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

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



module.exports = {
    getWebhook: getWebhook,
    postWebhook: postWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
    getFacebookUsername: getFacebookUsername,
    sendWelcomeNewClient: sendWelcomeNewClient,
    sendMainContent: sendMainContent,
    sendRegisterAdmissions: sendRegisterAdmissions,
    sendMajor: sendMajor,
    sendRecruitmentMethod: sendRecruitmentMethod,
    sendCompare: sendCompare,
    sendScholarshipPolicy: sendScholarshipPolicy,
    goBackRecruitmentMethod: goBackRecruitmentMethod,
    sendMessage: sendMessage,
    sendTypingOn: sendTypingOn,
    markMessageSeen: markMessageSeen
}