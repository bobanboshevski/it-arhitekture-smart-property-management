package com.smartrental.propertyservice.propertymanagement.application.service;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
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
    void shouldThrowExceptionWhenPropertyNotFound() {

        UUID id = UUID.randomUUID();

        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Property not found");
    }


}
