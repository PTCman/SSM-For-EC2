package com.project.ssm.search.service;

//import com.project.ssm.chat.model.entity.ChatRoom;
//import com.project.ssm.chat.model.entity.Message;
//import com.project.ssm.chat.repository.ChatRoomRepository;
//import com.project.ssm.chat.repository.MessageRepository;
import com.project.ssm.member.model.Member;
import com.project.ssm.member.repository.MemberRepository;
import com.project.ssm.search.model.response.MemberSearchRes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final MemberRepository memberRepository;
//    private final ChatRoomRepository chatRoomRepository;
//    private final MessageRepository messageRepository;

    public List<MemberSearchRes> searchMembers(String keyword) {
        List<Member> members = memberRepository.findByMemberNameContaining(keyword);
        List<MemberSearchRes> searchResults = new ArrayList<>();

        for (Member member : members) {
            MemberSearchRes searchRes = MemberSearchRes.builder()
                    .memberIdx(member.getMemberIdx())
                    .memberId(member.getMemberId())
                    .memberName(member.getMemberName())
                    .position(member.getPosition())
                    .department(member.getDepartment())
                    .build();
            searchResults.add(searchRes);
        }

        return searchResults;
    }




//    public List<ChatSearchRes> searchMessage(ChatSearchReq chatSearchReq) {
//        Optional<ChatRoom> chatRoom = chatRoomRepository.findByChatRoomId(chatSearchReq.getChatRoomId());
//        List<ChatSearchRes> messageList = new ArrayList<>();
//
//        if (chatRoom.isPresent()) {
//            List<Message> chatList = messageRepository.findByMessageContaining(chatSearchReq.getMessage());
//            for (Message message : chatList) {
//                messageList.add(ChatSearchRes.buildChatSearch(message.getMember().getMemberId(), message.getMessage()));
//            }
//            return messageList;
//        }
//        return null;
//    }
}
