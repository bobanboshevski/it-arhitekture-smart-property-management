package com.smartrental.propertyservice.roommanagement.domain.repository;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class RoomRepositoryTest {


    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    private Property createProperty() {
        Property property = Property.builder()
                .name("Test Property")
                .location("Test City")
                .basePrice(new BigDecimal("100"))
                .build();

        return propertyRepository.save(property);
    }

    @Test
    @DisplayName("Should save room successfully")
    void shouldSaveRoom() {

        Property property = createProperty();

        Room room = Room.builder()
                .name("Room 101")
                .capacity(2)
                .property(property)
                .build();

        Room saved = roomRepository.save(room);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Room 101");
    }

    @Test
    @DisplayName("Should find room by id")
    void shouldFindRoomById() {

        Property property = createProperty();

        Room saved = roomRepository.save(
                Room.builder()
                        .name("Room A")
                        .capacity(3)
                        .property(property)
                        .build()
        );

        Optional<Room> found = roomRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Room A");
    }

    @Test
    @DisplayName("Should return all rooms")
    void shouldFindAllRooms() {

        Property property = createProperty();

        roomRepository.save(Room.builder().name("R1").capacity(2).property(property).build());
        roomRepository.save(Room.builder().name("R2").capacity(4).property(property).build());

        List<Room> rooms = roomRepository.findAll();

        assertThat(rooms).hasSize(2);
    }

    @Test
    @DisplayName("Should delete room")
    void shouldDeleteRoom() {

        Property property = createProperty();

        Room room = roomRepository.save(
                Room.builder()
                        .name("Delete Test")
                        .capacity(1)
                        .property(property)
                        .build()
        );

        roomRepository.deleteById(room.getId());

        Optional<Room> result = roomRepository.findById(room.getId());

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should check if room exists")
    void shouldCheckIfRoomExists() {

        Property property = createProperty();

        Room room = roomRepository.save(
                Room.builder()
                        .name("Exists Test")
                        .capacity(2)
                        .property(property)
                        .build()
        );

        boolean exists = roomRepository.existsById(room.getId());

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false if room does not exist")
    void shouldReturnFalseWhenRoomDoesNotExist() {

        boolean exists = roomRepository.existsById(UUID.randomUUID());

        assertThat(exists).isFalse();
    }


}
