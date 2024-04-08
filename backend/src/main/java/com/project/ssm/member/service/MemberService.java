package com.project.ssm.member.service;

import com.project.ssm.chat.model.entity.RoomParticipants;
import com.project.ssm.common.BaseResponse;
import com.project.ssm.member.exception.MemberAccountException;
import com.project.ssm.member.exception.MemberDuplicateException;
import com.project.ssm.member.exception.MemberNotFoundException;
import com.project.ssm.member.model.Member;
import com.project.ssm.member.model.ProfileImage;
import com.project.ssm.member.model.request.*;
import com.project.ssm.member.model.response.*;
import com.project.ssm.member.repository.MemberRepository;
import com.project.ssm.member.repository.ProfileImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    @Value("${jwt.secret-key}")
    private String secretKey;
    @Value("${jwt.token.expired-time-ms}")
    private Long expiredTimeMs;

    private final MemberRepository memberRepository;
    private final ProfileImageRepository profileImageRepository;
    private final ProfileImageService profileImageService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public BaseResponse<PostMemberSignupRes> signup(PostMemberSignupReq req, MultipartFile profileImage) {
        Optional<Member> byMemberId = memberRepository.findByMemberId(req.getMemberId());
        if (byMemberId.isPresent()) {
            throw MemberDuplicateException.forMemberId(req.getMemberId());
        }
        Member member = memberRepository.save(
                Member.createMember(req.getMemberId(), passwordEncoder.encode(req.getPassword()),
                req.getMemberName(), req.getDepartment(), req.getPosition()));
        if (profileImage != null) {
            profileImageService.registerProfileImage(member, profileImage);
        }
        return BaseResponse.successRes("MEMBER_001", true, "회원이 등록되었습니다.", PostMemberSignupRes.buildSignUpRes(member));
    }

    public BaseResponse<PostMemberLoginRes> login(PostMemberLoginReq req) {
        Optional<Member> byMemberId = memberRepository.findByMemberId(req.getMemberId());

        if (byMemberId.isEmpty()) {
            throw MemberNotFoundException.forMemberId(req.getMemberId());
        }
        Member member = byMemberId.get();
        if (passwordEncoder.matches(req.getPassword(), member.getPassword()) && member.getStatus().equals(true)) {
            return BaseResponse.successRes("MEMBER_011", true, "로그인에 성공하였습니다.", PostMemberLoginRes.buildLoginRes(member, secretKey, expiredTimeMs));
        } else {
            throw MemberAccountException.forInvalidPassword();
        }
    }

    public BaseResponse<String> checkId(GetMemberCheckIdReq req) {
        Optional<Member> byMemberId = memberRepository.findByMemberId(req.getMemberId());
        if (byMemberId.isPresent()) {
            throw MemberDuplicateException.forMemberId(req.getMemberId());
        } else {
            return BaseResponse.successRes("MEMBER_024", true, "아이디 검사를 완료하였습니다.", "ok");
        }
    }

    @Transactional
    public BaseResponse<String> updatePassword(Member m, PatchMemberUpdatePasswordReq req, MultipartFile profileImage) {
        Optional<Member> byId = memberRepository.findById(m.getMemberIdx());

        if (byId.isPresent()) {
            Member member = byId.get();
            // 기존 비밀번호가 일치하지 않았을 때
            if (!passwordEncoder.matches(req.getPassword(), member.getPassword())) {
                throw MemberAccountException.forInvalidPassword();
            }
            // 기존 비밀번호를 제대로 입력했지만 새로운 비밀번호가 기존의 비밀번호와 같을 때
            else if (passwordEncoder.matches(req.getPassword(), member.getPassword())
                    && passwordEncoder.matches(req.getNewPassword(), member.getPassword())) {
                throw MemberAccountException.forDifferentPassword();
            } else {
                member.setMemberPw(passwordEncoder.encode(req.getNewPassword()));
                member.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")));
                memberRepository.save(member);

                if (profileImage != null) {
                    // 기존 프로필 이미지 DB에서 삭제
                    List<ProfileImage> profileImagesByMemberIdx = memberRepository.findByMemberIdx(m.getMemberIdx());
                    profileImageRepository.deleteAll(profileImagesByMemberIdx);
                    // 새로운 프로필 등록
                    profileImageService.registerProfileImage(member, profileImage);
                }
            }
        }
        return BaseResponse.successRes("MEMBER_35", true, "비밀번호 변경이 완료되었습니다.", "ok");
    }

    public BaseResponse<String> delete(Member m) {
        Optional<Member> byId = memberRepository.findById(m.getMemberIdx());

        if (byId.isPresent()) {
            Member member = byId.get();

            member.setStatus(false);
            member.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")));
            memberRepository.save(member);

            return BaseResponse.successRes("MEMBER_48", true, "회원 삭제가 정상적으로 처리되었습니다.", "ok");
        }
        return null;
    }

    // 멤버 조회를 위한 메소드
    public BaseResponse<List<GetMemberReadRes>> read(){
        List<Member> all = memberRepository.findAll();
        List<GetMemberReadRes> members = new ArrayList<>();

        for (Member member : all) {
            members.add(GetMemberReadRes.buildReadRes(member));
        }
        return BaseResponse.successRes("temp", true, "회원조회가 성공했습니다", members);
    }

    public List<GetProfileImageRes> getMemberProfile(GetProfileImageReq getProfileImageReq) {
        Optional<Member> member = memberRepository.findByMemberId(getProfileImageReq.getMemberId());
        List<GetProfileImageRes> getProfileImageRes = new ArrayList<>();

        if (member.isPresent()) {
            List<ProfileImage> profileImage = member.get().getProfileImage();
            for (ProfileImage image : profileImage) {
                getProfileImageRes.add(GetProfileImageRes.buildProfileImage(image.getImageAddr()));
            }
        }
        return getProfileImageRes;
    }

    public BaseResponse<List<GetChatRoomMembersRes>> getChatRoomMembers(String chatRoomId){
        List<RoomParticipants> memberNameByChatRoomInMember = memberRepository.findMemberNameByChatRoomName(chatRoomId);
        if(memberNameByChatRoomInMember.isEmpty()){
            throw MemberNotFoundException.forChatRoomId();
        }
        List<GetChatRoomMembersRes> members = new ArrayList<>();
        for (RoomParticipants roomParticipants : memberNameByChatRoomInMember) {
            members.add(GetChatRoomMembersRes.buildReadRes(roomParticipants.getMember()));
        }
        return BaseResponse.successRes("Member49",true, "채팅방 회원의 조회가 성공했습니다.", members);
    }
}
