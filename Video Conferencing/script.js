const socket = io();
const peer = new Peer();

let localStream;
let remotePeers = {};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localStream = stream;
        document.getElementById("localVideo").srcObject = stream;
    })
    .catch((error) => console.error("Error accessing media devices.", error));

peer.on("open", (id) => {
    socket.emit("join-room", "myRoom", id);
});

socket.on("user-connected", (userId) => {
    const call = peer.call(userId, localStream);
    call.on("stream", (remoteStream) => {
        if (!remotePeers[userId]) {
            const videoElement = document.createElement("video");
            videoElement.srcObject = remoteStream;
            videoElement.autoplay = true;
            document.getElementById("remoteVideos").appendChild(videoElement);
            remotePeers[userId] = videoElement;
        }
    });
});

peer.on("call", (call) => {
    call.answer(localStream);
    call.on("stream", (remoteStream) => {
        if (!remotePeers[call.peer]) {
            const videoElement = document.createElement("video");
            videoElement.srcObject = remoteStream;
            videoElement.autoplay = true;
            document.getElementById("remoteVideos").appendChild(videoElement);
            remotePeers[call.peer] = videoElement;
        }
    });
});

socket.on("user-disconnected", (userId) => {
    if (remotePeers[userId]) {
        remotePeers[userId].remove();
        delete remotePeers[userId];
    }
});


document.getElementById("shareScreen").addEventListener("click", async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        
        for (let connId in remotePeers) {
            const sender = peer.connections[connId]?.[0]?.peerConnection.getSenders()
                .find(s => s.track.kind === "video");
            if (sender) sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
            for (let connId in remotePeers) {
                const sender = peer.connections[connId]?.[0]?.peerConnection.getSenders()
                    .find(s => s.track.kind === "video");
                if (sender) sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
        };
    } catch (error) {
        console.error("Error sharing screen:", error);
    }
});


const chatInput = document.getElementById("chatInput");
const chatBox = document.getElementById("chatBox");

chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const message = chatInput.value;
        socket.emit("chat-message", message);
        chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
        chatInput.value = "";
    }
});

socket.on("chat-message", (message) => {
    chatBox.innerHTML += `<p><strong>Guest:</strong> ${message}</p>`;
});


let isVirtualBackgroundOn = false;

document.getElementById("toggleVirtualBackground").addEventListener("click", () => {
    if (!isVirtualBackgroundOn) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        setInterval(() => {
            ctx.drawImage(localStream.getVideoTracks()[0], 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "blue";  // Simulated virtual background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }, 100);

        const newStream = canvas.captureStream();
        localStream.getVideoTracks()[0].stop();
        localStream = newStream;

        document.getElementById("localVideo").srcObject = localStream;
    } else {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream = stream;
                document.getElementById("localVideo").srcObject = stream;
            });
    }
    isVirtualBackgroundOn = !isVirtualBackgroundOn;
});
