import {defineStore} from "pinia";
import SockJS from "sockjs-client";
import Stomp from "webstomp-client";
import { useMessageStore } from "@/stores/useMessageStore";

export const useStompStore = defineStore("stomp", {
    state: () => ({ test: [] }),
    actions: {
        basicConnect(stompClient) {
            console.log("================store============")
            console.log(stompClient);
            if (stompClient.ws.readyState === 0) {
                console.log("============기본 연결================");
                stompClient.connect(
                    {},
                    frame => {
                        this.connected = true;
                        console.log('소켓 연결 성공', frame);
                        stompClient.subscribe("/sub/room", res => {
                            console.log("구독으로 받은 메시지입니다.", res.body);
                            useMessageStore().addMessage(JSON.parse(res.body));
                        });
                    },
                    error => {
                        console.log('소켓 연결 실패', error);
                        this.connected = false;
                    }
                )
            }
        },
        roomConnect(chatRoomId, token) {
            console.log(chatRoomId);
            console.log(token);
            const server = "http://localhost:8080/chat"
            let socket = new SockJS(server);
            this.stompClient = Stomp.over(socket);
            console.log(`소켓 연결을 시도 중 서버 주소: ${server}`)
            window.localStorage.setItem("chatRoomId", chatRoomId);
            // this.getChatList(chatRoomId, token, 1, 4);
            this.stompClient.connect(
                {},
                frame => {
                    this.connected = true;
                    console.log('소켓 연결 성공', frame);
                    this.stompClient.subscribe("/sub/room/" + chatRoomId, res => {
                        console.log("연결 후 채팅방 아이디", chatRoomId);
                        console.log(res);
                        console.log("구독으로 받은 메시지입니다.", res.body);
                        useMessageStore().addMessage(JSON.parse(res.body));
                    });
                },
                error => {
                    console.log('소켓 연결 실패', error);
                    this.connected = false;
                }
            )
        },
    },
    getters: {
        getAllMessage(state) {
            return state.recvList;
        }
    }
})