const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const server = require('http').Server(app);
const io = require('socket.io')(server);

let senderStream = {};

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// io.on("connection", socket => {
//     console.log("user connected");
//     // Listen on join event 
//     socket.on("roomId", async (params, callback) => {

//         if (params.roomId) {
//             // Join room by room id
//             // socket.join(params.roomId);
//             console.log(params.roomId);
//             senderStream[params.roomId + ''] = params.roomId;
//             callback();
//         }

//     });
// });
app.post('/broadcast', async ({
    body
}, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [{
            urls: "stun:stun.stunprotocol.org"
        }]
    });
    // console.log(body.sdp);
    peer.ontrack = (e) => handleTrackEvent(e, peer, body.roomId);
    console.log(body.roomId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, peer, roomId) {
    senderStream[roomId] = e.streams[0];
    console.log(senderStream[roomId]);
};

app.post("/consumer", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    // console.log(body.sdp);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream[body.roomId].getTracks().forEach(track => peer.addTrack(track, senderStream[body.roomId]));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});


server.listen(5000, () => console.log('server started'));