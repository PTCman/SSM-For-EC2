import { defineStore } from "pinia";
import axios from "axios";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const backend = process.env.VUE_APP_API_ENDPOINT
const storedToken = localStorage.getItem("accessToken");
const timeout = 10000;
export const useMainStore = defineStore("main", {
  state: () => ({
    // 토큰 데이터 들어가는 곳
    member: {
      memberId: "",
      name: "",
      department: "",
      position: "",
      profileImage: "",
    },
    meetingRooms: [],
    // readMember 데이터 들어가는 곳
    members: [],

    // 멤버찾기 모달을 위한 변수
    memberSearchStatus: false,


    searchMemberName: "",
    // 검색 된 데이터가 들어가는 변수
    searchedMember: {
      memberId: "",
      name: "",
      department: "",
      position: "",
    },
    // 필터 목록에 멤버이름 들어가는 곳
    filteredMemberNames: [],
    checkedMembers: [],

    // 필터 그룹의 채팅룸 객체가 들어가는곳
    selectedChatRoom: "",
  }),
  actions: {
    base64UrlDecode(input) {
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    },
    loadMemberData() {
      if (storedToken !== null) {
        const token = storedToken.replace("Bearer ", "");
        const payload = token.split('.')[1]; // JWT의 두 번째 부분이 페이로드입니다.
        const tokenData = this.base64UrlDecode(payload);

        this.member.memberId = tokenData.memberId;
        this.member.name = tokenData.memberName;
        this.member.department = tokenData.department;
        this.member.position = tokenData.position;

        // 태초의 필터 목록에 본인 이름을 넣는다.
        this.filteredMemberNames = [];
        this.filteredMemberNames.push(this.member.name);
      } else {
        toast.error('권한이 없는 사용자입니다. 다시 로그인해주세요', {
          timeout: timeout
        })
      }
    },
    async onDateClick(date) {
      date = new Date(date);
      let year = date.getFullYear();
      let month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1을 해주고, 두 자리로 표시하도록 포맷합니다.
      let day = ('0' + date.getDate()).slice(-2);
      const formattedDate = year + "-" + month + "-" + day;
      try {
        const response = await axios.get(backend + `/calendar/event/date/${formattedDate}`, {
          headers: {
            Authorization: localStorage.getItem('accessToken'),
          }
        })
        toast(response.data.message, {
          timeout: timeout
        });
        return response.data;
      } catch (error) {
        toast.error(error.response.data.message, {
          timeout: timeout,
        })
        return null;
      }
    },
    requestNotificationPermission() {
      // 알림 기능을 지원하는지 확인
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않습니다.");
      } else if (Notification.permission === "granted") {
        // 이미 권한이 부여된 경우
        console.log("알림 권한이 이미 부여되었습니다.");
      } else if (Notification.permission !== "denied") {
        // 권한 요청
        Notification.requestPermission().then(function (permission) {
          // 사용자가 알림을 허용하면
          if (permission === "granted") {
            console.log("알림 권한이 부여되었습니다.");
          }
        });
      }
    },
    notificaiton() {
      this.requestNotificationPermission();

      const evtSource = new EventSource(backend + "/notification/" + this.member.memberId);
      evtSource.addEventListener("test", function (event) {
        console.log(event.data)
      })
      evtSource.addEventListener("notification", function (event) {
        console.log(event.data)
        toast.success(event.data, {
          timeout: timeout,
        });
        if (Notification.permission === "granted") {
          new Notification("알람 이벤트", {
            body: event.data,
          });
        }
      }, false);
    },

    async readMeetingRooms() {
      try {
        const response = await axios.get(backend + '/meetingroom/current');
        this.meetingRooms = response.data.result;
        toast(response.data.message, {
          timeout: timeout
        });
      } catch (error) {
        console.error('회의실 정보를 가져오지 못했습니다:', error);
        toast.error(error.response.data.message, {
          timeout: timeout,
        })
      }
    },

    // 멤버 정보를 불러온다.
    async readMember() {
      try {
        const response = await axios.get(backend + '/member/read');
        this.members = response.data.result;
        toast(response.data.message, {
          timeout: timeout
        });
      } catch (error) {
        console.error('멤버 정보를 가져오지 못했습니다:', error);
        toast.error(error.response.data.message, {
          timeout: timeout,
        })
      }
    },
    async getProfileImage() {
      const response = await axios.post(backend + '/member/profile', {
        memberId: this.member.memberId
      })
      this.member.profileImage = response.data[0].imageAddr;
    },
    async getChatProfile(memberId) {
      try {
        const response = await axios.post(backend + '/member/profile', {
          memberId: memberId
        })
        toast(response.data.message, {
          timeout: timeout
        });
        return response.data[0].imageAddr;
      } catch (error) {
        toast.error(error.response.data.message, {
          timeout: timeout,
        })
      }
    },

    openComponent() {
      this.searchedMember = [];
      this.memberSearchStatus = !this.memberSearchStatus;
    },

    // 멤버찾기 메서드
    async searchMembers() {
      try {
        const response = await axios.get(`${backend}/search/member/${this.searchMemberName}`);
        this.searchedMember = response.data;
        toast(response.data.message, {
          timeout: timeout
        });
      } catch (error) {
        toast.error(error.response.data.message, {
          timeout: timeout,
          // 여기에 추가 옵션을 넣을 수 있습니다.
        })
      }
    },

    // 필터목록에 멤버 넣는 함수
    addFilteredMemberName() {
      this.searchedMember.forEach(member => {
        if (member.checked && !this.filteredMemberNames.includes(member.memberName)) {
          this.filteredMemberNames.push(member.memberName);
        }
      });
    },

    async onChatRoomChange() {
      console.log('채팅방 바꾸기');
      if (this.selectedChatRoom === '일반일정' || this.selectedChatRoom === '') {
        this.filteredMemberNames = []
        this.filteredMemberNames.push(this.member.name)
      } else {
        try {
          const response = await axios.get(`${backend}/member/chatroommembers?chatRoomId=${this.selectedChatRoom.chatRoomId}`);
          this.filteredMemberNames = []
          this.filteredMemberNames = response.data.result.map(member => member.memberName);
        }
        catch (error) {
          toast.error(error.response.message, {
            timeout: timeout,
          })
        }
      }
    },
  },
})