import { defineStore } from "pinia";
import axios from "axios";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


// const backend = 'http://192.168.0.41/api'
const backend = 'http://localhost:8080';
const storedToken = localStorage.getItem("accessToken");

export const useMemberStore = defineStore("member", {
    state: () => ({
        member:{
            memberId:"",
            memberPw:"",
            memberPwChecked:"",
            memberOldPw:"", 
            name: "",
            department: "",
            position: "",
            profileImage: null,
        },
        checkId: false,
    }),
    actions: {
        async login(member) {
            let loginMember = { memberId: member.memberId, password: member.memberPw }
            try{
                let response = await axios.post(backend + "/member/login", loginMember, {
                    headers:{
                        "Content-Type": "application/json",
                    }
                });
                console.log(response.data);
                localStorage.removeItem("accessToken")
                localStorage.setItem("accessToken", "Bearer " + response.data.result.token);

                window.location.href = "/";
            }catch(error){
                console.log("에러 발생", error);
                localStorage.removeItem("accessToken");
                this.member.memberId="";
                this.member.memberPw="";
                toast.error(error.response.data.message, {
                    timeout: 10000,
                    // 여기에 추가 옵션을 넣을 수 있습니다.
                })
            }          
          },
        async signup(){
            if(this.checkId === false){
                toast.error("아이디 중복체크를 하세요", {
                    timeout: 10000,
                    // 여기에 추가 옵션을 넣을 수 있습니다.
                })
            }
            if(this.member.memberPw !== this.member.memberPwChecked){
                toast.error("새롭게 입력하신 비밀번호가 서로 다릅니다.", {
                    timeout: 10000,
                    // 여기에 추가 옵션을 넣을 수 있습니다.
                })
            }

            if(this.member.memberPw === this.member.memberPwChecked && this.checkId){
                let signupMember = {
                    memberId: this.member.memberId, 
                    password: this.member.memberPw,
                    memberName: this.member.name,
                    department: this.member.department,
                    position: this.member.position}

                let formData = new FormData();
                let json = JSON.stringify(signupMember);
                console.log(json)
                formData.append(
                    "member",
                    new Blob([json], { type: "application/json" })
                );

                formData.append("profileImage", this.member.profileImage);
                
                console.log(this.member.profileImage)
                try{
                    let response = await axios.post(backend + "/member/signup", formData, {
                        headers:{
                            "Content-Type": "multipart/form-data",    
                        }
                    });                
                    localStorage.setItem("toastMessage", response.data.message);                      
                    window.location.href = "/login";

                }catch(error){
                    toast.error(error.response.data.message, {
                        timeout: 10000,
                        // 여기에 추가 옵션을 넣을 수 있습니다.
                    })
                }
            }
        },
        async changeInfo(){
            if(this.member.memberPw === this.member.memberPwChecked){
                let changeInfoMember = {
                    password: this.member.memberOldPw, 
                    newPassword: this.member.memberPw,
                }

                let formData = new FormData();
                let json = JSON.stringify(changeInfoMember);
                console.log(json)
                formData.append(
                    "member",
                    new Blob([json], { type: "application/json" })
                );
                
                formData.append("profileImage", this.member.profileImage);
                console.log(this.member.profileImage);

                try{
                    let response = await axios.patch(backend + "/member/update", formData, {
                        headers:{
                            "Content-Type": "multipart/form-data",
                            "Authorization": storedToken
                        }
                    });                 
                    localStorage.removeItem("accessToken")             
                    localStorage.setItem("toastMessage", response.data.message);                 
                    
                    window.location.href = "/login";

                       
                }catch(error){
                    if(error.response.data.code === "MEMBER_016" || error.response.data.code === "MEMBER_036"){
                        toast.error(error.response.data.message, {
                            timeout: 10000,
                            // 여기에 추가 옵션을 넣을 수 있습니다.
                        })
                    }    
                }
            }else{
                toast.error("새롭게 입력하신 비밀번호가 서로 다릅니다.", {
                    timeout: 10000,
                    // 여기에 추가 옵션을 넣을 수 있습니다.
                })
            }
        },
        // 비밀번호 변경 후 로그인 페이지에서 toast를 실행시키기 위한 메서드
        checkForToastMessage() {
            const toastMessage = localStorage.getItem("toastMessage");
            if (toastMessage) {
              toast(toastMessage, {
                timeout: 10000,
                // 여기에 추가적인 toast 옵션을 설정할 수 있습니다.
              });
              localStorage.removeItem("toastMessage"); // 메시지를 표시한 후에는 삭제
            }
        },
        // 아이디 중복 확인
        async checkIdDuplicate() {
            const req = {
                memberId: this.member.memberId
            }
            try {
              const response = await axios.post(backend + '/member/check/id', req);
              toast(response.data.message, {
                timeout: 10000,
                // 여기에 추가 옵션을 넣을 수 있습니다.
            })
                this.checkId = true;

            } catch (error) {
                toast.error(error.response.data.message, {
                    timeout: 10000,
                    // 여기에 추가 옵션을 넣을 수 있습니다.
                })
                this.checkId = false;
            }
        },
    },
})