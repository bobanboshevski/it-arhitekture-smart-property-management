package com.smartrental.propertyservice.propertymanagement.domain.repository;

import com.smartrental.propertyservice.propertymanagement.domain.model.Property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository {

    Property save(Property property);

    Optional<Property> findById(UUID id);

    List<Property> findAll();

    void deleteById(UUID id);

}
