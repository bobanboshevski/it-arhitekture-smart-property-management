package com.smartrental.propertyservice.propertymanagement.interfaces.rest;

import com.smartrental.propertyservice.propertymanagement.application.service.PropertyService;
import com.smartrental.propertyservice.propertymanagement.domain.model.Property;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyRequestDTO;
import com.smartrental.propertyservice.propertymanagement.interfaces.dto.PropertyResponseDTO;
import com.smartrental.propertyservice.propertymanagement.interfaces.mapper.PropertyMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Property", description = "API for managing properties")
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public PropertyResponseDTO create(@RequestBody PropertyRequestDTO dto) {
        Property property = PropertyMapper.toEntity(dto);

        Property saved = propertyService.create(property);

        return PropertyMapper.toDTO(saved);
    }

    @GetMapping("/{id}")
    public PropertyResponseDTO getById(@PathVariable UUID id) {

        Property property = propertyService.findById(id);

        return PropertyMapper.toDTO(property);
    }

    @PutMapping("/{id}")
    public PropertyResponseDTO update(@PathVariable UUID id, @RequestBody PropertyRequestDTO dto) {

        Property updated = propertyService.update(id, dto);

        return PropertyMapper.toDTO(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        propertyService.delete(id);
    }

    @GetMapping
    public List<PropertyResponseDTO> getAll() {
        return propertyService.findAll().stream()
                .map(PropertyMapper::toDTO)
                .toList();
    }


}
