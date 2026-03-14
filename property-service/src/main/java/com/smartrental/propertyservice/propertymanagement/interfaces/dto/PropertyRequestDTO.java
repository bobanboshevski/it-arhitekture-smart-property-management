package com.smartrental.propertyservice.propertymanagement.interfaces.dto;

import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // todo: what is this?
public class PropertyRequestDTO {

    private String name;

    private String location;

    private BigDecimal basePrice;

    private List<RoomResponseDTO> rooms;
}
