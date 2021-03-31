let roomId;

// const socket = io();

function getRoomId() {
    let roomId = document.getElementById('roomId').value;
    console.log(roomId);
    if (roomId !== '') {
        return roomId;
    }
    return null;
}

window.onload = () => {
    // socket.on('connect', () => {

        // console.log(params);
        document.getElementById('my-button').onclick = () => {
            if (!(roomId = getRoomId())) {
                return alert("please enter correct room id");
            }
 
            let params = {
                roomId: roomId,
            }
            console.log(params);
            init();
            // socket.emit('roomId', params, () => {
            //     console.log('roomId has been sent');
            //     init();
            // });
        }
       
    // });
}


async function init() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [{
            urls: "stun:stun.stunprotocol.org"
        }]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription,
        roomId: roomId
    };
    console.log(payload);
    const {
        data
    } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}