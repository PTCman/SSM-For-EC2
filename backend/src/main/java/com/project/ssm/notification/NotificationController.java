package com.project.ssm.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@Slf4j
@CrossOrigin("*")
public class NotificationController {

    private static final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @RequestMapping(value = "/notification", method = RequestMethod.GET)
    public SseEmitter handle() {
        SseEmitter emitter = new SseEmitter(1800000L);
        log.info("emitter: {}",emitter);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        return emitter;
    }

    // 알람 발생 시 모든 클라이언트에게 알람 전송
    public static void sendAlarmToClients(String message) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(message));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
