package com.smartrental.propertyservice.propertymanagement.interfaces.mapper;


import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyResponseDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;

import java.util.List;
import java.util.stream.Collectors;

// todo: lahko bi uporabili tudi mapstruct, ampak zaenkrat ročno mapiranje, ker je enostavno in imamo samo nekaj mapiranj
public class PropertyMapper {

    private PropertyMapper() {
        // private constructor to prevent instantiation
    }

    public static Property toEntity(PropertyRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Property.builder()
                .name(dto.getName())
                .location(dto.getLocation())
                .basePrice(dto.getBasePrice())
//                .rooms(mapRoomsToEntities(dto.getRooms()))
                .build();
    }

    public static PropertyResponseDTO toDTO(Property property) {
        if (property == null) {
            return null;
        }

        return PropertyResponseDTO.builder()
                .id(property.getId())
                .name(property.getName())
                .location(property.getLocation())
                .basePrice(property.getBasePrice())
//                .rooms(mapRoomsToDTOs(property.getRooms()))
                .build();
    }

    private static List<Room> mapRoomsToEntities(List<RoomResponseDTO> rooms) {
        if (rooms == null) {
            return List.of();
        }

        return rooms.stream()
                .map(roomDTO -> Room.builder()
                        .name(roomDTO.getName())
                        .capacity(roomDTO.getCapacity())
                        .build())
                .collect(Collectors.toList());
    }

    private static List<RoomResponseDTO> mapRoomsToDTO(List<Room> rooms) {
        if (rooms == null) {
            return List.of();
        }

        return rooms.stream()
                .map(room -> RoomResponseDTO.builder()
                        .id(String.valueOf(room.getId()))
                        .name(room.getName())
                        .capacity(room.getCapacity())
                        .build())
                .collect(Collectors.toList());
    }


}


