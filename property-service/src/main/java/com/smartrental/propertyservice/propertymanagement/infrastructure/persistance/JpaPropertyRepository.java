package com.smartrental.propertyservice.propertymanagement.infrastructure.persistance;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JpaPropertyRepository extends JpaRepository<Property, UUID>, PropertyRepository {
}
