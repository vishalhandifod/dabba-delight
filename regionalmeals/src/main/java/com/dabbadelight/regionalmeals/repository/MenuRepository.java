package com.dabbadelight.regionalmeals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long>{

}
