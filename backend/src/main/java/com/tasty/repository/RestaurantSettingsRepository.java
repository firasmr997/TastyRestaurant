package com.tasty.repository;

import com.tasty.entity.RestaurantSettings;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Short> {

    @EntityGraph(attributePaths = {"promoMenuItem", "promoMenuItem.category"})
    Optional<RestaurantSettings> findWithPromoById(Short id);
}
