package com.smartrental.propertyservice.propertymanagement.interfaces.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.propertyservice.propertymanagement.application.service.PropertyService;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;


import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PropertyController.class)
public class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PropertyService service;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldGetPropertyById() throws Exception {

        UUID id = UUID.randomUUID();

        Property property = Property.builder()
                .id(id)
                .name("Apartment")
                .location("Ljubljana")
                .basePrice(new BigDecimal("100"))
                .build();

        when(service.findById(id)).thenReturn(property);

        mockMvc.perform(get("/api/properties/" + id))
                .andExpect(status().isOk());
    }

    @Test
    void shouldCreateProperty() throws Exception {

        PropertyRequestDTO dto = new PropertyRequestDTO();
        dto.setName("Hotel");
        dto.setLocation("Ohrid");
        dto.setBasePrice(new BigDecimal("150"));

        Property property = Property.builder()
                .id(UUID.randomUUID())
                .name("Hotel")
                .location("Ohrid")
                .basePrice(new BigDecimal("150"))
                .build();

        when(service.create(org.mockito.Mockito.any())).thenReturn(property);

        mockMvc.perform(post("/api/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

}
