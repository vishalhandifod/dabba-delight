package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dabbadelight.regionalmeals.model.Kitchen.KitchenAddress;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.service.KitchenAddressService;
import com.dabbadelight.regionalmeals.service.MenuService;

@RestController
@RequestMapping("/api/kitchen_address")
public class KitchenAddressController {

    private final KitchenAddressService kitchenAddressService;
    private final MenuService menuService;

    public KitchenAddressController (KitchenAddressService kitchenAddressService, MenuService menuService) {
        this.kitchenAddressService = kitchenAddressService;
        this.menuService = menuService;
    }

    @PostMapping("/menu/{menuId}")
    public ResponseEntity<KitchenAddress> createKitchenAddress(@RequestBody KitchenAddress kitchenAddress, @PathVariable Long menuId) {
        Menu menu = menuService.getMenuById(menuId);
        kitchenAddress.setMenu(menu);
        KitchenAddress savedKitchenAddress = kitchenAddressService.createKitchenAddress(kitchenAddress);
        return new ResponseEntity<>(savedKitchenAddress, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KitchenAddress> getKitchenAddressById(@PathVariable Long id) {
        KitchenAddress kitchenAddress = kitchenAddressService.getKitchenAddressById(id);
        return ResponseEntity.ok(kitchenAddress);
    }

    @GetMapping
    public ResponseEntity<List<KitchenAddress>> getAllKitchenAddresses() {
        return ResponseEntity.ok(kitchenAddressService.getAllKitchenAddresses());
    }
    
    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<KitchenAddress>> getKitchenAddressByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(kitchenAddressService.getKitchenAddressByMenuId(menuId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<KitchenAddress> updateKitchenAddress(@PathVariable Long id, @RequestBody KitchenAddress kitchenAddress) {
        KitchenAddress updatedKitchenAddress = kitchenAddressService.updateKitchenAddress(id, kitchenAddress);
        return ResponseEntity.ok(updatedKitchenAddress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKitchenAddress(@PathVariable Long id) {
        kitchenAddressService.deleteKitchenAddress(id);
        return ResponseEntity.noContent().build();
    }
}
