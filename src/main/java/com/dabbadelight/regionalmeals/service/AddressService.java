package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.User.Address;

public interface AddressService {

    Address createAddress(Address address);
    List<Address> getAllAddresses();
    Address getAddressById(Long id);
    List<Address> getAddressByUserId(Long userId);
    Address updateAddress(Long id, Address address);
    void deleteAddress(Long id);
}
