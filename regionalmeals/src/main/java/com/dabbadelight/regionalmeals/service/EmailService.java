package com.dabbadelight.regionalmeals.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    private void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your OTP Code");
            message.setText("Your OTP is: " + otp + "\nIt expires in 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            // Only log the exception, not the OTP itself
            System.out.println("❌ Failed to send OTP email to " + toEmail + ": " + e.getMessage());
        }
    }

}
