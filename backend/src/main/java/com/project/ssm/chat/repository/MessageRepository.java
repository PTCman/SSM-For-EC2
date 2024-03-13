package com.project.ssm.chat.repository;

import com.project.ssm.chat.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
