package com.example.chatservice.repository;

import com.example.chatservice.entity.Conversation;
import com.example.chatservice.entity.ConversationStatus;
import com.example.chatservice.entity.ConversationType;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findByParticipantHash(String participantHash);
    Page<Conversation> findByParticipantsUserId(UUID userId, Pageable pageable);
    Page<Conversation> findByConversationTypeAndParticipantsUserId(ConversationType conversationType, UUID userId, Pageable pageable);

    @Query("SELECT c FROM Conversation c JOIN c.participants p " +
            "WHERE p.userId = :userId " +
            "AND c.conversationType = :type " +
            "AND c.status <> :excludeStatus")
    Optional<Conversation> findActiveSupportConversation(
            @Param("userId") UUID userId,
            @Param("type") ConversationType type,
            @Param("excludeStatus") ConversationStatus excludeStatus
    );

    List<Conversation> findByConversationTypeAndStatus(
            ConversationType conversationType,
            ConversationStatus status
    );

    @Query("SELECT c FROM Conversation c JOIN c.participants p " +
            "WHERE p.userId = :adminId " +
            "AND c.conversationType = :type " +
            "AND c.status = :status")
    List<Conversation> findActiveByAdminId(
            @Param("adminId") UUID adminId,
            @Param("type") ConversationType type,
            @Param("status") ConversationStatus status
    );
}
