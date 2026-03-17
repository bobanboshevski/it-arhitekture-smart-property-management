package com.smartrental.propertyservice.propertymanagement.interfaces.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.propertyservice.propertymanagement.application.service.PropertyService;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;


import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PropertyController.class)
public class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PropertyService propertyService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Property buildProperty(UUID id) {
        return Property.builder()
                .id(id)
                .name("Apartment")
                .location("Ljubljana")
                .basePrice(new BigDecimal("100"))
                .build();
    }

    @Test
    void shouldCreateProperty() throws Exception {

        PropertyRequestDTO dto = new PropertyRequestDTO();
        dto.setName("Hotel");
        dto.setLocation("Ohrid");
        dto.setBasePrice(new BigDecimal("150"));

        Property property = buildProperty(UUID.randomUUID());

        when(propertyService.create(any(Property.class))).thenReturn(property);

        mockMvc.perform(post("/api/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(propertyService).create(any(Property.class));
    }

    @Test
    void shouldGetPropertyById() throws Exception {

        UUID id = UUID.randomUUID();

        when(propertyService.findById(id)).thenReturn(buildProperty(id));

        mockMvc.perform(get("/api/properties/" + id))
                .andExpect(status().isOk());

        verify(propertyService).findById(id);
    }

    @Test
    void shouldReturn404WhenPropertyNotFound() throws Exception {

        UUID id = UUID.randomUUID();

        when(propertyService.findById(id))
                .thenThrow(new ResourceNotFoundException("Property not found"));

        mockMvc.perform(get("/api/properties/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateProperty() throws Exception {

        UUID id = UUID.randomUUID();

        PropertyRequestDTO dto = new PropertyRequestDTO();
        dto.setName("Updated");
        dto.setLocation("Updated City");
        dto.setBasePrice(new BigDecimal("200"));

        when(propertyService.update(eq(id), any(PropertyRequestDTO.class)))
                .thenReturn(buildProperty(id));

        mockMvc.perform(put("/api/properties/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(propertyService).update(eq(id), any(PropertyRequestDTO.class));
    }

    @Test
    void shouldDeleteProperty() throws Exception {

        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/properties/" + id))
                .andExpect(status().isOk());

        verify(propertyService).delete(id);
    }

    @Test
    void shouldReturnAllProperties() throws Exception {

        List<Property> properties = List.of(
                buildProperty(UUID.randomUUID()),
                buildProperty(UUID.randomUUID())
        );

        when(propertyService.findAll()).thenReturn(properties);

        mockMvc.perform(get("/api/properties"))
                .andExpect(status().isOk());

        verify(propertyService).findAll();
    }


}
