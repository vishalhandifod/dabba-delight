package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Kitchen.KitchenAddress;

@Repository
public interface KitchenAddressRepository extends JpaRepository<KitchenAddress, Long> {

    List<KitchenAddress> findByMenuId(Long menuId);

}
