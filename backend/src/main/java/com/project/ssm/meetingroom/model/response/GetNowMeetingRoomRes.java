package com.project.ssm.meetingroom.model.response;

import com.project.ssm.meetingroom.model.entity.MeetingRoom;
import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
@Builder
public class GetNowMeetingRoomRes {

    @NotBlank
    private Boolean isAvailable;

    @NotBlank
    private Long meetingRoomIdx;
    private String meetingRoomName;

    public static GetNowMeetingRoomRes buildMeetingRoomRes(MeetingRoom meetingRoom){
        return GetNowMeetingRoomRes.builder()
                .isAvailable(meetingRoom.getIsAvailable())
                .meetingRoomIdx(meetingRoom.getMeetingRoomIdx())
                .meetingRoomName(meetingRoom.getMeetingRoomName())
                .build();
    }

}
