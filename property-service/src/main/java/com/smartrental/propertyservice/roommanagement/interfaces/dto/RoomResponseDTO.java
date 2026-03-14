package com.smartrental.propertyservice.roommanagement.interfaces.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponseDTO {

    private String id;
    private String name;
    private Integer capacity;
    private UUID propertyId;
}
