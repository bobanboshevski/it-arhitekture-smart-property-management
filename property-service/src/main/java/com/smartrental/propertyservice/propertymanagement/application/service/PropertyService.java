package com.smartrental.propertyservice.propertymanagement.application.service;

// Application layer (Business Logic Layer)

import com.smartrental.propertyservice.shared.exception.ResourceNotFoundException;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.domain.repository.PropertyRepository;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyService {

    private final PropertyRepository propertyRepository;

    // TODO: MOVE THE LOGIC TO THE USECASE directory

    public Property create(Property property) {
        log.info("Creating property: {}", property.getName());
        return propertyRepository.save(property);
    }

    public List<Property> findAll() {
        log.info("Finding all properties");
        return propertyRepository.findAll();
    }

    public Property findById(UUID id) {
        log.info("Finding property by id: {}", id);
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
    }

    public Property update(UUID id, PropertyRequestDTO dto) {

        log.info("Updating property with id: {}", id);

        Property existing = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        existing.setName(dto.getName());
        existing.setLocation(dto.getLocation());
        existing.setBasePrice(dto.getBasePrice());

        return propertyRepository.save(existing);
    }

    public void delete(UUID id) {
        log.info("Deleting property with id: {}", id);
        propertyRepository.deleteById(id);
    }

}
