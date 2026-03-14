package com.smartrental.propertyservice.propertymanagement.interfaces.dto;

import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponseDTO {

    private UUID id;

    private String name;

    private String location;

    private BigDecimal basePrice;

    private List<RoomResponseDTO> rooms;
}
