package com.tasty.repository;

import com.tasty.entity.MenuItemImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemImageRepository extends JpaRepository<MenuItemImage, Long> {

    boolean existsByStorageKey(String storageKey);
}
