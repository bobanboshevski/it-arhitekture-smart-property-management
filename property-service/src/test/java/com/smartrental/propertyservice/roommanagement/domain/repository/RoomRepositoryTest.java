package com.smartrental.propertyservice.roommanagement.domain.repository;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class RoomRepositoryTest {


    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Test
    void testSaveRoom() {

        Property property = Property.builder()
                .name("Test Property")
                .location("Test City")
                .basePrice(new BigDecimal("100"))
                .build();

        Property savedProperty = propertyRepository.save(property);

        Room room = Room.builder()
                .name("Room 101")
                .capacity(2)
                .property(savedProperty)
                .build();

        Room saved = roomRepository.save(room);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Room 101");
    }

}
