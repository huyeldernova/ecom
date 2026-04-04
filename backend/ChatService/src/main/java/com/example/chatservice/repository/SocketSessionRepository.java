package com.example.chatservice.repository;

import com.example.chatservice.entity.SocketSession;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocketSessionRepository extends CrudRepository<SocketSession, String> {

    List<SocketSession> findByUserId(String userId);

    void deleteBySocketSessionId(String socketSessionId);
}
