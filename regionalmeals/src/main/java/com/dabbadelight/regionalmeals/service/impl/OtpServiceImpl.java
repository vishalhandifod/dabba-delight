package com.dabbadelight.regionalmeals.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dabbadelight.regionalmeals.model.Otp;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.repository.OtpRepository;
import com.dabbadelight.regionalmeals.service.OtpService;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;

    private static final int OTP_EXPIRY_MINUTES = 5; // 5 minutes
    private static final int OTP_LENGTH = 6;

    // Injected from application.properties
    @Value("${otp.mail.from}")
    private String verifiedFromEmail;

    public OtpServiceImpl(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Override
    public String generateOtp(User user) {
        clearExistingOtps(user);

        String otpValue = generateRandomOtp();

        Otp otp = new Otp();
        otp.setOtp(otpValue);
        otp.setUser(user);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpRepository.save(otp);

        sendOtpEmailAsync(user.getEmail(), otpValue);

        System.out.println("OTP generated for user: " + user.getEmail());
        return otpValue;
    }

    // Async email sending to avoid blocking
    @Async
    public void sendOtpEmailAsync(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromEmail = verifiedFromEmail;
            String fromName = "Dabba Delight";

            try {
                helper.setFrom(fromEmail, fromName); // May throw UnsupportedEncodingException
            } catch (java.io.UnsupportedEncodingException e) {
                System.out.println("❌ Invalid encoding for sender name. Using email only.");
                helper.setFrom(fromEmail); // fallback
            }

            helper.setTo(toEmail);
            helper.setSubject("🔒 Your OTP Code");

            String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border-radius:10px; background-color:#f7f9fc; border:1px solid #e1e4e8;">
                <h2 style="text-align:center; color:#333;">Your OTP Code</h2>
                <p style="text-align:center; color:#555;">Use the following OTP to complete your verification.</p>
                <div style="text-align:center; margin: 20px 0;">
                    <span style="font-size: 36px; font-weight:bold; color:#1d4ed8; letter-spacing:4px;">%s</span>
                </div>
                <p style="text-align:center; color:#999; font-size:14px;">This OTP will expire in 5 minutes.</p>
                <hr style="border:none; border-top:1px solid #e1e4e8; margin:20px 0;">
                <p style="text-align:center; color:#777; font-size:12px;">If you did not request this OTP, please ignore this email.</p>
            </div>
            """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Modern OTP email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.out.println("❌ Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }


    @Override
    public boolean validateOtp(User user, String submittedOtp) {
        try {
            Optional<Otp> otpOptional = otpRepository.findByUserAndExpiresAtAfter(user, LocalDateTime.now());

            if (otpOptional.isEmpty()) {
                System.out.println("❌ No valid OTP found or expired for: " + user.getEmail());
                return false;
            }

            Otp storedOtp = otpOptional.get();
            if (storedOtp.getOtp().equals(submittedOtp)) {
                otpRepository.delete(storedOtp);
                System.out.println("✅ OTP validated and deleted for user: " + user.getEmail());
                return true;
            }

            System.out.println("❌ OTP mismatch for user: " + user.getEmail());
            return false;
        } catch (Exception e) {
            System.out.println("❌ Error validating OTP: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void clearExistingOtps(User user) {
        try {
            otpRepository.deleteByUser(user);
            System.out.println("🗑️ Cleared existing OTPs for user: " + user.getEmail());
        } catch (Exception e) {
            System.out.println("❌ Error clearing OTPs: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            System.out.println("🧹 Cleaned up expired OTPs");
        } catch (Exception e) {
            System.out.println("❌ Error cleaning up expired OTPs: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateRandomOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();

        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
