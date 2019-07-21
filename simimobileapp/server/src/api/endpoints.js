const REST = {
    root: "https://simichat.net/mobile",
    chatLog: "/chatLog",
    download: "/download",
    user: "/user",
    inbox: "/inbox",
    login: "/loginUser",
    question: "/question",
    swipeDeck: "/swipeDeck",
    reformQueue: "/reformQueue",
    knowledgeBase: "/knowledgeBase",
    rightSwipe: "/rightSwipe",
    leftSwipe: "/leftSwipe",
    cleanup: "/cleanup",
    methods: {
        post: "post",
        get: "get",
        delete: "delete",
    }
}

const socket = {
    message: "message",
    connect: "connect",
    connection: "connection",
    disconnect: "disconnect",
    reconnect: "reconnect",
    smeFound: "smeFound",
    opFound: "opFound",
    join: "join",
    leave: "leave",
    isTyping: "isTyping",
    feedback: "feedback",
    alert: "alert",
    onUserId: "onUserId",
    onSwipeDeck: "onSwipeDeck",
    mode: {
        end: "end",
        next: "next",
    },
    alerts: {
        disconnect: "Chat Partner Has Disconnected"
    }
}

module.exports = {
    REST: REST,
    socket: socket,
}