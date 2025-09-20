package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import com.dabbadelight.regionalmeals.model.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.dabbadelight.regionalmeals.model.User.Address;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.service.AddressService;
import com.dabbadelight.regionalmeals.service.UserService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // Create Address for Logged-in User
    @PostMapping
    public ResponseEntity<Address> createAddress(@Valid @RequestBody Address address,
                                                 @AuthenticationPrincipal User loggedInUser) {
        address.setUser(loggedInUser);
        Address savedAddress = addressService.createAddress(address);
        return new ResponseEntity<>(savedAddress, HttpStatus.CREATED);
    }

    // Get All Addresses of Logged-in User
    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal User loggedInUser) {
        return ResponseEntity.ok(addressService.getAddressByUserId(loggedInUser.getId()));
    }

    // Get Address by ID
    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddressById(@PathVariable Long addressId,
                                                  @AuthenticationPrincipal User loggedInUser) {
        Address address = addressService.getAddressById(addressId);
        if (!address.getUser().getId().equals(loggedInUser.getId()) && loggedInUser.getRole() != Role.SUPERADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(address);
    }

    // Update Address
    @PutMapping("/{addressId}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long addressId,
                                                 @Valid @RequestBody Address address,
                                                 @AuthenticationPrincipal User loggedInUser) {
        Address existingAddress = addressService.getAddressById(addressId);
        if (!existingAddress.getUser().getId().equals(loggedInUser.getId()) &&
                loggedInUser.getRole() != Role.SUPERADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Address updatedAddress = addressService.updateAddress(addressId, address);
        return ResponseEntity.ok(updatedAddress);
    }

    // Delete Address
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId,
                                              @AuthenticationPrincipal User loggedInUser) {
        Address existingAddress = addressService.getAddressById(addressId);
        if (!existingAddress.getUser().getId().equals(loggedInUser.getId()) &&
                loggedInUser.getRole() != Role.SUPERADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
}
