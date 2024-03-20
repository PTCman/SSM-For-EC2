import { defineStore } from "pinia";
import axios from "axios";
import {toRaw} from "vue";

const backend = 'http://localhost:8080'

export const useChatRoomStore = defineStore("chatRoom", {
    state: () => ({
        roomName: "",
        roomList: [],
        chatRoomId: "",
    }),
    actions: {
        async getRoomList() {
            let response = await axios.get(`${backend}/chat/rooms`, {
                headers: {
                    Authorization: localStorage.getItem("accessToken")
                },
            });
            console.log(response.data.result);
            response.data.result.forEach((chatRoom) => {
                this.roomList.push(chatRoom);
            })
            return toRaw(this.roomList);
        },
    }
})