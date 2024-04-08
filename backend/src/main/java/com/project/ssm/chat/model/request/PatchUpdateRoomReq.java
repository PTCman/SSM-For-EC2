package com.project.ssm.chat.model.request;

import lombok.*;

import javax.validation.constraints.NotBlank;
import java.util.List;

@Builder
@Getter
@Setter
public class PatchUpdateRoomReq {
    @NotBlank
    private String chatRoomId;
    private List<String> memberId;
}
