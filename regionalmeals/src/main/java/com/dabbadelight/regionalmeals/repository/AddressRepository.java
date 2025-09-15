package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.User.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long>{
    
    List<Address> findByUserId(Long userId);
}
