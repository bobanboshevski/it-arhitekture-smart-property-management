package com.smartrental.propertyservice.roommanagement.application.service;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.domain.repository.RoomRepository;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    private RoomRequestDTO buildDTO(UUID propertyId) {
        RoomRequestDTO dto = new RoomRequestDTO();
        dto.setName("Room A");
        dto.setCapacity(3);
        dto.setPropertyId(propertyId.toString());
        return dto;
    }

    @Test
    void shouldCreateRoom() {

        UUID propertyId = UUID.randomUUID();

        Property property = new Property();
        property.setId(propertyId);

        RoomRequestDTO dto = buildDTO(propertyId);

        when(propertyRepository.findById(propertyId))
                .thenReturn(Optional.of(property));

        when(roomRepository.save(any(Room.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Room result = roomService.create(dto);

        assertThat(result.getName()).isEqualTo("Room A");
        assertThat(result.getCapacity()).isEqualTo(3);

        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void shouldThrowExceptionWhenPropertyNotFoundOnCreate() {

        UUID propertyId = UUID.randomUUID();

        RoomRequestDTO dto = buildDTO(propertyId);

        when(propertyRepository.findById(propertyId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.create(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Property not found");
    }

    @Test
    void shouldReturnAllRooms() {

        when(roomRepository.findAll())
                .thenReturn(List.of(new Room(), new Room()));

        List<Room> result = roomService.findAll();

        assertThat(result).hasSize(2);

        verify(roomRepository).findAll();
    }

    @Test
    void shouldReturnRoomById() {

        UUID id = UUID.randomUUID();

        Room room = new Room();
        room.setId(id);

        when(roomRepository.findById(id))
                .thenReturn(Optional.of(room));

        Room result = roomService.findById(id);

        assertThat(result.getId()).isEqualTo(id);
    }

    @Test
    void shouldThrowExceptionWhenRoomNotFound() {

        UUID id = UUID.randomUUID();

        when(roomRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.findById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldUpdateRoom() {

        UUID roomId = UUID.randomUUID();
        UUID propertyId = UUID.randomUUID();

        Room existing = new Room();
        existing.setId(roomId);

        Property property = new Property();
        property.setId(propertyId);

        RoomRequestDTO dto = buildDTO(propertyId);

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(existing));

        when(propertyRepository.findById(propertyId))
                .thenReturn(Optional.of(property));

        when(roomRepository.save(existing))
                .thenReturn(existing);

        Room result = roomService.update(roomId, dto);

        assertThat(result.getName()).isEqualTo("Room A");

        verify(roomRepository).save(existing);
    }

    @Test
    void shouldThrowExceptionWhenRoomNotFoundDuringUpdate() {

        UUID id = UUID.randomUUID();

        RoomRequestDTO dto = buildDTO(UUID.randomUUID());

        when(roomRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.update(id, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldThrowExceptionWhenPropertyNotFoundDuringUpdate() {

        UUID roomId = UUID.randomUUID();
        UUID propertyId = UUID.randomUUID();

        Room room = new Room();
        room.setId(roomId);

        RoomRequestDTO dto = buildDTO(propertyId);

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(room));

        when(propertyRepository.findById(propertyId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.update(roomId, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldDeleteRoom() {

        UUID id = UUID.randomUUID();

        when(roomRepository.existsById(id)).thenReturn(true);

        roomService.delete(id);

        verify(roomRepository).deleteById(id);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingRoom() {

        UUID id = UUID.randomUUID();

        when(roomRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> roomService.delete(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

}
