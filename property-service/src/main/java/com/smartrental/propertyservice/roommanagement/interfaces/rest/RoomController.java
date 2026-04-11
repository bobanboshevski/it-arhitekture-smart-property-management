package com.smartrental.propertyservice.roommanagement.interfaces.rest;

import com.smartrental.propertyservice.roommanagement.application.service.RoomService;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomResponseDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.mapper.RoomMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Rooms", description = "Room management API")
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

    @GetMapping("/{roomid}/exists")
    public ResponseEntity<Boolean> checkRoomExists(@PathVariable UUID roomid) {
        boolean exists = roomService.roomExists(roomid);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/{roomId}/basePrice")
    public ResponseEntity<Map<String, BigDecimal>> getRoomPrice(@PathVariable String roomId) {

        // all the rooms in the same property have the same based price, stored in the property entity
        BigDecimal price = roomService.getBasePriceByRoomId(roomId);

        if (price == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of("price", price));
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get all rooms for a specific property")
    public List<RoomResponseDTO> getRoomsByProperty(@PathVariable UUID propertyId) {
        log.info("Fetching rooms for property: {}", propertyId);
        return roomService.findByPropertyId(propertyId)
                .stream()
                .map(RoomMapper::toDTO)
                .toList();
    }

}
