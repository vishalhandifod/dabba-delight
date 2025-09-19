package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.User.Address;
import com.dabbadelight.regionalmeals.repository.AddressRepository;
import com.dabbadelight.regionalmeals.service.AddressService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    
    public AddressServiceImpl(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Override
    public Address createAddress(Address address) {
        return addressRepository.save(address);
    }

    @Override
    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    @Override
    public Address getAddressById(Long id) {
        return addressRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Address with ID not found: " + id));
    }

    @Override
    public Address updateAddress(Long id, Address address) {
        Address addressDetails = getAddressById(id);
        addressDetails.setAddressLine1(address.getAddressLine1());
        addressDetails.setAddressLine2(address.getAddressLine2());
        addressDetails.setCity(address.getCity());
        addressDetails.setPincode(address.getPincode());
        addressDetails.setLandmark(address.getLandmark());
        addressDetails.setFlatOrBlock(address.getFlatOrBlock());

        return addressRepository.save(addressDetails);
    }

    @Override
    public void deleteAddress(Long id) {
        Address address = getAddressById(id);
        addressRepository.delete(address);
    }

    @Override
    public List<Address> getAddressByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

}
