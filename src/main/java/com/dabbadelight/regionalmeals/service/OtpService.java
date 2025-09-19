package com.dabbadelight.regionalmeals.service;

import com.dabbadelight.regionalmeals.model.User.User;

public interface OtpService {
    String generateOtp(User user);
    boolean validateOtp(User user, String submittedOtp);
    void clearExistingOtps(User user);
    void cleanupExpiredOtps();
}