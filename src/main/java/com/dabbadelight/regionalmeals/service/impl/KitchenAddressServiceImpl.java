package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.Kitchen.KitchenAddress;
import com.dabbadelight.regionalmeals.repository.KitchenAddressRepository;
import com.dabbadelight.regionalmeals.service.KitchenAddressService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class KitchenAddressServiceImpl implements KitchenAddressService{

    private final KitchenAddressRepository kitchenAddressRepository;

    public KitchenAddressServiceImpl(KitchenAddressRepository kitchenAddressRepository) {
        this.kitchenAddressRepository = kitchenAddressRepository;
    }

    @Override
    public KitchenAddress createKitchenAddress(KitchenAddress kitchenAddress) {
        return kitchenAddressRepository.save(kitchenAddress);
    }

    @Override
    public KitchenAddress getKitchenAddressById(Long id) {
        return kitchenAddressRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Kitchen Address with ID not found: " + id));
    }

    @Override
    public List<KitchenAddress> getAllKitchenAddresses() {
        return kitchenAddressRepository.findAll();
    }

    @Override
    public KitchenAddress updateKitchenAddress(Long id, KitchenAddress kitchenAddress) {
        KitchenAddress updatedKitchenAddress = getKitchenAddressById(id);
        updatedKitchenAddress.setAddressLine1(kitchenAddress.getAddressLine1());
        updatedKitchenAddress.setAddressLine2(kitchenAddress.getAddressLine2());
        updatedKitchenAddress.setLandmark(kitchenAddress.getLandmark());
        updatedKitchenAddress.setCity(kitchenAddress.getCity());
        updatedKitchenAddress.setPincode(kitchenAddress.getPincode());
        return kitchenAddressRepository.save(updatedKitchenAddress);

    }

    @Override
    public void deleteKitchenAddress(Long id) {
        KitchenAddress kitchenAddress = getKitchenAddressById(id);
        kitchenAddressRepository.delete(kitchenAddress);
    }

    @Override
    public List<KitchenAddress> getKitchenAddressByMenuId(Long menuId) {
        return kitchenAddressRepository.findByMenuId(menuId);
    }

}
