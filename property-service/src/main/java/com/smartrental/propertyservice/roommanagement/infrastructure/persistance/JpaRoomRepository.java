package com.smartrental.propertyservice.roommanagement.infrastructure.persistance;

import com.smartrental.propertyservice.roommanagement.domain.model.Room;
import com.smartrental.propertyservice.roommanagement.domain.repository.RoomRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JpaRoomRepository extends JpaRepository<Room, UUID>, RoomRepository {


}
