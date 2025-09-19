package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.Kitchen.KitchenAddress;

public interface KitchenAddressService {

    KitchenAddress createKitchenAddress(KitchenAddress kitchenAddress);
    KitchenAddress getKitchenAddressById(Long id);
    List<KitchenAddress> getAllKitchenAddresses();
    List<KitchenAddress> getKitchenAddressByMenuId(Long menuId);
    KitchenAddress updateKitchenAddress(Long id, KitchenAddress kitchenAddress);
    void deleteKitchenAddress(Long id);

}
