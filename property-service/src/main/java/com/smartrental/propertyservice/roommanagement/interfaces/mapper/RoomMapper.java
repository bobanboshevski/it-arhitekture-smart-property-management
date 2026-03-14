package com.smartrental.propertyservice.roommanagement.interfaces.mapper;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;

public class RoomMapper {

    public static Room toEntity(RoomRequestDTO dto, Property property) {

        if (dto == null) {
            return null;
        }

        return Room.builder()
                .name(dto.getName())
                .capacity(dto.getCapacity())
                .property(property)
                .build();
    }

    public static RoomResponseDTO toDTO(Room room) {
        if (room == null) {
            return null;
        }

        return RoomResponseDTO.builder()
                .id(String.valueOf(room.getId()))
                .name(room.getName())
                .capacity(room.getCapacity())
                .propertyId(room.getProperty().getId())
                .build();
    }

}
