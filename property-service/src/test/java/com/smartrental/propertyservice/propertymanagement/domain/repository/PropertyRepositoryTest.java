package com.smartrental.propertyservice.propertymanagement.domain.repository;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.infrastructure.persistance.JpaPropertyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
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

}
