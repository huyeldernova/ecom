package com.example.notificationservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationDltHandler {

    @KafkaListener(
            topics = {
                    "user.registered.DLT",
                    "payment.succeeded.DLT",
                    "payment.failed.DLT"
            },
            groupId = "notification-service-dlt"
    )
    public void handleDlt(
            @Payload Object message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.EXCEPTION_MESSAGE) String errorMessage) {

        log.error("================================================");
        log.error("DLT message received!");
        log.error("Topic  : {}", topic);
        log.error("Error  : {}", errorMessage);
        log.error("Message: {}", message);
        log.error("================================================");
    }
}
