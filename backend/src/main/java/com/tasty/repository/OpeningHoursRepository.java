package com.tasty.repository;

import com.tasty.entity.OpeningHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpeningHoursRepository extends JpaRepository<OpeningHours, Long> {

    List<OpeningHours> findAllByOrderByDayOfWeekAsc();
}
