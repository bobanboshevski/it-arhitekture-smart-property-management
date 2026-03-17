package com.smartrental.propertyservice.propertymanagement.domain.repository;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.infrastructure.persistance.JpaPropertyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class PropertyRepositoryTest {

    // tests database interaction

    @Autowired
    private PropertyRepository repository;

    @Test
    @DisplayName("Should save property successfully")
    void shouldSaveProperty() {

        Property property = Property.builder()
                .name("Luxury Apartment")
                .location("Ljubljana")
                .basePrice(new BigDecimal("120"))
                .build();

        Property saved = repository.save(property);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Luxury Apartment");
    }

    @Test
    @DisplayName("Should find property by id")
    void shouldFindById() {

        Property property = Property.builder()
                .name("Test Property")
                .location("Maribor")
                .basePrice(new BigDecimal("90"))
                .build();

        Property saved = repository.save(property);

        Optional<Property> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Property");
    }

    @Test
    @DisplayName("Should return all properties")
    void shouldFindAll() {

        repository.save(Property.builder()
                .name("P1")
                .location("City1")
                .basePrice(new BigDecimal("50"))
                .build());

        repository.save(Property.builder()
                .name("P2")
                .location("City2")
                .basePrice(new BigDecimal("70"))
                .build());

        List<Property> properties = repository.findAll();

        assertThat(properties).hasSize(2);
    }

    @Test
    @DisplayName("Should delete property")
    void shouldDeleteProperty() {

        Property property = repository.save(
                Property.builder()
                        .name("Delete Test")
                        .location("City")
                        .basePrice(new BigDecimal("80"))
                        .build()
        );

        repository.deleteById(property.getId());

        Optional<Property> result = repository.findById(property.getId());

        assertThat(result).isEmpty();
    }

}
