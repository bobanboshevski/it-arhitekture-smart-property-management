package com.smartrental.propertyservice.propertymanagement.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String location;

    private BigDecimal basePrice;

    // todo: im not sure if i need this
    //    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    //    private List<Room> rooms;
}
