package com.smartrental.propertyservice.roommanagement.interfaces.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequestDTO {


    private String name;
    private Integer capacity;
    private String propertyId;
}
