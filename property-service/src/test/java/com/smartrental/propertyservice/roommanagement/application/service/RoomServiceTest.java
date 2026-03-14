package com.smartrental.propertyservice.roommanagement.application.service;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.domain.repository.RoomRepository;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateRoom() {
        UUID propertyId = UUID.randomUUID();
        RoomRequestDTO dto = new RoomRequestDTO();
        dto.setName("Room A");
        dto.setCapacity(3);
        dto.setPropertyId(propertyId.toString());

        Property property = new Property();
        property.setId(propertyId);

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(property));

        Room savedRoom = new Room();
        savedRoom.setName("Room A");
        savedRoom.setCapacity(3);
        savedRoom.setProperty(property);

        when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

        Room result = roomService.create(dto);

        assertThat(result.getName()).isEqualTo("Room A");
        assertThat(result.getCapacity()).isEqualTo(3);
        verify(roomRepository, times(1)).save(any(Room.class));
    }

}
