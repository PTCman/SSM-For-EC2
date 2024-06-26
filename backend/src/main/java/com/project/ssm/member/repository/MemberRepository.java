package com.project.ssm.member.repository;

import com.project.ssm.member.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>, MemberCustomRepository{
    Optional<Member> findByMemberId(String memberId);
    Optional<Member> findMemberByMemberIdx(Long memberIdx);
    Optional<Member> findByMemberName(String memberName);
    List<Member> findByMemberNameContaining(String keyword);
}
