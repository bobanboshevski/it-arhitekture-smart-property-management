package com.smartrental.propertyservice.roommanagement.interfaces.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.roommanagement.application.service.RoomService;
import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.interfaces.dto.RoomRequestDTO;
import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoomController.class)
public class RoomControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private RoomService roomService;

    private Room buildRoom(UUID id) {
        Property property = new Property();
        property.setId(UUID.randomUUID());

        Room room = new Room();
        room.setId(id);
        room.setName("Room A");
        room.setCapacity(3);
        room.setProperty(property);

        return room;
    }

    @Test
    void shouldCreateRoom() throws Exception {

        UUID id = UUID.randomUUID();

        RoomRequestDTO dto = new RoomRequestDTO();
        dto.setName("Room A");
        dto.setCapacity(2);
        dto.setPropertyId(UUID.randomUUID().toString());

        when(roomService.create(any(RoomRequestDTO.class)))
                .thenReturn(buildRoom(id));

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(roomService).create(any(RoomRequestDTO.class));
    }

    @Test
    void shouldReturnAllRooms() throws Exception {

        when(roomService.findAll())
                .thenReturn(List.of(
                        buildRoom(UUID.randomUUID()),
                        buildRoom(UUID.randomUUID())
                ));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk());

        verify(roomService).findAll();
    }

    @Test
    void shouldReturnRoomById() throws Exception {

        UUID id = UUID.randomUUID();

        when(roomService.findById(id)).thenReturn(buildRoom(id));

        mockMvc.perform(get("/api/rooms/" + id))
                .andExpect(status().isOk());

        verify(roomService).findById(id);
    }

    @Test
    void shouldReturn404WhenRoomNotFound() throws Exception {

        UUID id = UUID.randomUUID();

        when(roomService.findById(id))
                .thenThrow(new ResourceNotFoundException("Room not found"));

        mockMvc.perform(get("/api/rooms/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateRoom() throws Exception {

        UUID id = UUID.randomUUID();

        RoomRequestDTO dto = new RoomRequestDTO();
        dto.setName("Updated Room");
        dto.setCapacity(4);
        dto.setPropertyId(UUID.randomUUID().toString());

        when(roomService.update(eq(id), any(RoomRequestDTO.class)))
                .thenReturn(buildRoom(id));

        mockMvc.perform(put("/api/rooms/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(roomService).update(eq(id), any(RoomRequestDTO.class));
    }

    @Test
    void shouldDeleteRoom() throws Exception {

        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/rooms/" + id))
                .andExpect(status().isOk());

        verify(roomService).delete(id);
    }


}
