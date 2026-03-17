package com.smartrental.propertyservice.propertymanagement.application.service;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PropertyServiceTest {

    @Mock
    private PropertyRepository repository;

    @InjectMocks
    private PropertyService service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldCreateProperty() {

        Property property = Property.builder()
                .name("Hotel")
                .location("Ohrid")
                .basePrice(new BigDecimal("150"))
                .build();

        when(repository.save(property)).thenReturn(property);

        Property result = service.create(property);

        assertThat(result.getName()).isEqualTo("Hotel");
        verify(repository).save(property);
    }

    @Test
    void shouldReturnAllProperties() {

        List<Property> properties = List.of(
                Property.builder()
                        .name("Apartment")
                        .location("Ljubljana")
                        .basePrice(new BigDecimal("100"))
                        .build(),
                Property.builder()
                        .name("Villa")
                        .location("Ohrid")
                        .basePrice(new BigDecimal("200"))
                        .build()
        );

        when(repository.findAll()).thenReturn(properties);

        List<Property> result = service.findAll();

        assertThat(result).hasSize(2);
        verify(repository).findAll();
    }

    @Test
    void shouldReturnPropertyById() {

        UUID id = UUID.randomUUID();

        Property property = Property.builder()
                .id(id)
                .name("Villa")
                .location("Ohrid")
                .basePrice(new BigDecimal("200"))
                .build();

        when(repository.findById(id)).thenReturn(Optional.of(property));

        Property result = service.findById(id);

        assertThat(result.getName()).isEqualTo("Villa");
        verify(repository).findById(id);
    }

    @Test
    void shouldUpdateProperty() {

        UUID id = UUID.randomUUID();

        Property existing = Property.builder()
                .id(id)
                .name("Old Name")
                .location("Old City")
                .basePrice(new BigDecimal("100"))
                .build();

        PropertyRequestDTO dto = new PropertyRequestDTO();
        dto.setName("Updated Name");
        dto.setLocation("Updated City");
        dto.setBasePrice(new BigDecimal("150"));

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        Property result = service.update(id, dto);

        assertThat(result.getName()).isEqualTo("Updated Name");
        assertThat(result.getLocation()).isEqualTo("Updated City");
        assertThat(result.getBasePrice()).isEqualTo(new BigDecimal("150"));

        verify(repository).findById(id);
        verify(repository).save(existing);
    }

    @Test
    void shouldThrowExceptionWhenPropertyNotFound() {

        UUID id = UUID.randomUUID();

        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Property not found");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingProperty() {

        UUID id = UUID.randomUUID();

        PropertyRequestDTO dto = new PropertyRequestDTO();
        dto.setName("Updated");
        dto.setLocation("City");
        dto.setBasePrice(new BigDecimal("100"));

        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Property not found");
    }

    @Test
    void shouldDeleteProperty() {

        UUID id = UUID.randomUUID();

        service.delete(id);

        verify(repository).deleteById(id);
    }

}
