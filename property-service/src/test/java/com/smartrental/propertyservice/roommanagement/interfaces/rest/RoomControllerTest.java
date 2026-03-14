package com.smartrental.propertyservice.roommanagement.interfaces.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.roommanagement.application.service.RoomService;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoomController.class)
public class RoomControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private RoomService roomService;

    @Test
    void testCreateRoomEndpoint() throws Exception {
        RoomRequestDTO dto = new RoomRequestDTO();
        dto.setName("Room X");
        dto.setCapacity(2);
        dto.setPropertyId(UUID.randomUUID().toString());

        Property property = new Property();
        property.setId(UUID.randomUUID());

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName(dto.getName());
        room.setCapacity(dto.getCapacity());
        room.setProperty(property);

        Mockito.when(roomService.create(Mockito.any(RoomRequestDTO.class))).thenReturn(room);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    // todo: DONT FORGET
    //    GET /api/rooms
    //    GET /api/rooms/{id}
    //    PUT /api/rooms/{id}
    //    DELETE /api/rooms/{id}


}
