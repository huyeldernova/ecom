package com.example.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    //  Method chung — tất cả method bên dưới đều gọi vào đây
    private void sendEmail(String to, String subject, String templateName, Context context) {
        try {
            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    //  Welcome
    public void sendWelcomeEmail(String to, String name) {
        Context context = new Context();
        context.setVariable("name", name);

        sendEmail(to, "Chào mừng đến với ShopNow!", "email/welcome", context);
    }

    // Payment Success
    public void sendPaymentSuccessEmail(String to, String name, String orderId, BigDecimal amount, String currency, LocalDateTime paidAt) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("orderId", orderId);
        context.setVariable("amount", amount);
        context.setVariable("currency", currency);
        context.setVariable("paidAt", paidAt);

        sendEmail(to, "Thanh toán thành công - Đơn hàng #" + orderId, "email/payment-success", context);
    }

    // Payment Failed
    public void sendPaymentFailedEmail(String to, String name,
                                       String orderId, BigDecimal amount,
                                       String currency) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("orderId", orderId);
        context.setVariable("amount", amount);
        context.setVariable("currency", currency);

        sendEmail(to, "Thanh toán thất bại - Đơn hàng #" + orderId, "email/payment-failed", context);
    }

    // OTP xác thực email khi đăng ký
    public void sendVerificationOtp(String to, String firstName, String otp) {
        Context context = new Context();
        context.setVariable("firstName", firstName);
        context.setVariable("otp", otp);

        sendEmail(to, "Xác thực email ShopNow — mã OTP của bạn", "email/otp-verification", context);
    }

    // OTP reset password
    public void sendPasswordResetOtp(String to, String firstName, String otp) {
        Context context = new Context();
        context.setVariable("firstName", firstName);
        context.setVariable("otp", otp);

        sendEmail(to, "Đặt lại mật khẩu ShopNow — mã OTP của bạn", "email/otp-reset-password", context);
    }
}
