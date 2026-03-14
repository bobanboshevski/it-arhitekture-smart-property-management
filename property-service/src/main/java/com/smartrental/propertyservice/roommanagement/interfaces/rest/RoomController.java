package com.smartrental.propertyservice.roommanagement.interfaces.rest;

import com.smartrental.propertyservice.roommanagement.application.service.RoomService;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.mapper.RoomMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name= "Rooms", description = "Room management API")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public RoomResponseDTO createRoom(@RequestBody RoomRequestDTO dto) {

        Room saved = roomService.create(dto);

        return RoomMapper.toDTO(saved);
    }

    @GetMapping
    public List<RoomResponseDTO> getAllRooms() {
        return roomService.findAll().stream()
                .map(RoomMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public RoomResponseDTO getRoomById(@PathVariable UUID id) {
        Room room = roomService.findById(id);
        return RoomMapper.toDTO(room);
    }

    @PutMapping("/{id}")
    public RoomResponseDTO updateRoom(@PathVariable UUID id, @RequestBody RoomRequestDTO dto) {

        Room updated = roomService.update(id, dto);

        return RoomMapper.toDTO(updated);
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable UUID id) {
        roomService.delete(id);
    }
}
