package com.smartrental.propertyservice.roommanagement.application.service;

import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.roommanagement.domain.repository.RoomRepository;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.roommanagement.interfaces.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public Room create(RoomRequestDTO dto) {

        log.info("Creating room: {} for property: {}", dto.getName(), dto.getPropertyId());

        Property property = propertyRepository.findById(UUID.fromString(dto.getPropertyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + dto.getPropertyId()));

        Room room = RoomMapper.toEntity(dto, property);

        return roomRepository.save(room);
    }

    public List<Room> findAll() {

        log.info("Finding all rooms");

        return roomRepository.findAll();
    }

    public Room findById(UUID id) {

        log.info("Finding room by id: {}", id);

        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    public Room update(UUID id, RoomRequestDTO dto) {

        log.info("Updating room with id: {}", id);

        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        Property property = propertyRepository.findById(UUID.fromString(dto.getPropertyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + dto.getPropertyId()));

        existing.setName(dto.getName());
        existing.setCapacity(dto.getCapacity());
        existing.setProperty(property);

        return roomRepository.save(existing);
    }

    public void delete(UUID id) {

        log.info("Deleting room with id: {}", id);

        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with id: " + id);
        }

        roomRepository.deleteById(id);
    }

    public boolean roomExists(UUID roomId) {
        log.info("Checking if room exists with id: {}", roomId);
        return roomRepository.existsById(roomId);
    }

    public BigDecimal getBasePriceByRoomId(String roomId) {
        Room room = roomRepository.findById(UUID.fromString(roomId))
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Property property = propertyRepository.findById(room.getProperty().getId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        return property.getBasePrice();
    }

    public List<Room> findByPropertyId(UUID propertyId) {
        log.info("Finding rooms for property id: {}", propertyId);

        // Verify the property exists first — throws 404 if not
        propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property not found with id: " + propertyId));

        return roomRepository.findByPropertyId(propertyId);

    }


}
