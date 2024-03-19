package com.project.ssm.events.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomReservationReq {
    private Long meetingRoomIdx;
    private List<MemberRequest> members;
    private String startedAt;
    private String closedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberRequest {
        private String memberName;
    }
}