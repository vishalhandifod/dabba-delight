package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>{

    List<Item> findByMenuId(Long id);

}
