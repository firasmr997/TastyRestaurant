package com.tasty.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categories")
public class Category extends AuditableEntity {

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "name_fr", length = 80)
    private String nameFr;

    @Column(nullable = false, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "description_fr", length = 500)
    private String descriptionFr;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active = true;
}
