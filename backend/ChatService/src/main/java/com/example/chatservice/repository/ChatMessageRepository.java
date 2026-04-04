package com.example.chatservice.repository;

import com.example.chatservice.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT m FROM ChatMessage m WHERE m.conversation.id = :conversationId ORDER BY m.sentAt DESC")
    Page<ChatMessage> findByConversationIdOrderBySentAtDesc(
            @Param("conversationId") UUID conversationId,
            Pageable pageable);
}