package com.example.ecomerce.service;

import com.example.ecomerce.entity.OutboxEvent;
import com.example.ecomerce.enums.OutboxStatus;
import com.example.ecomerce.repository.OutboxRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private static final int MAX_RETRY = 3;

    @Scheduled(fixedRate = 5000)
    public void process() {

        List<OutboxEvent> events = outboxRepository
                .findByStatusAndRetryCountLessThan(
                        OutboxStatus.PENDING,
                        MAX_RETRY
                );

        for (OutboxEvent event : events) {
            try {
                // Deserialize payload → đúng class
                Class<?> eventClass = Class.forName(event.getEventType());
                Object eventObject = objectMapper.readValue(
                        event.getPayload(),
                        eventClass
                );

                // Gửi Object lên Kafka như cũ!
                kafkaTemplate.send(event.getTopic(), eventObject);

                event.setStatus(OutboxStatus.SENT);
                log.info("Sent: {}", event.getId());

            } catch (Exception e) {
                event.setRetryCount(event.getRetryCount() + 1);

                if (event.getRetryCount() >= MAX_RETRY) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("Failed after {} retries: {}",
                            MAX_RETRY, event.getId());
                } else {
                    log.warn("Retry {}/{}: {}",
                            event.getRetryCount(), MAX_RETRY, event.getId());
                }
                outboxRepository.save(event);
            }
            outboxRepository.save(event);
        }
    }
}