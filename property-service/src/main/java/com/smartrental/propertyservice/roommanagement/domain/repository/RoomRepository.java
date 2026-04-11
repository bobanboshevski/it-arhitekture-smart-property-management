package com.smartrental.propertyservice.roommanagement.domain.repository;

import com.smartrental.propertyservice.roommanagement.domain.model.Room;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository {

    Room save(Room room);

    Optional<Room> findById(UUID id);

    List<Room> findAll();

    void deleteById(UUID id);

    boolean existsById(UUID id);

    List<Room> findByPropertyId(UUID propertyId);
}
