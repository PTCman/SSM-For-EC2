package com.project.ssm.chat.controller;

import com.project.ssm.chat.model.request.SendMessageReq;
import com.project.ssm.chat.model.request.UpdateMessageReq;
import com.project.ssm.chat.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class ChatController {

    private final MessageService messageService;

    @MessageMapping("/room/{roomId}")
    public void sendMessage(@DestinationVariable(value = "roomId") String roomId, SendMessageReq sendMessageReq) {
        messageService.sendMessage(roomId, sendMessageReq);
    }

    @MessageMapping("/room/{roomId}/update")
    public void updateMessage(@DestinationVariable(value = "roomId") String roomId, UpdateMessageReq updateMessageReq) {
        messageService.updateMessage(roomId, updateMessageReq);
    }


}
