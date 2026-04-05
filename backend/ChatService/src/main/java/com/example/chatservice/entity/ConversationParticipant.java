package com.example.chatservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id", "user_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "username")
    private String username;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}