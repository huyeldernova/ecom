package com.example.chatservice.controller;

import com.example.chatservice.dto.response.ApiResponses;
import com.example.chatservice.dto.response.OnlineStatusResponse;
import com.example.chatservice.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserStatusController {

    private final UserStatusService userStatusService;


    @GetMapping("/{userId}/online-status")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
   public ApiResponses<OnlineStatusResponse>getOnlineStatus( @PathVariable String userId){

        return ApiResponses.<OnlineStatusResponse> builder()
                .code(HttpStatus.OK.value())
                .message("User online status retrieved successfully")
                .data(userStatusService.getOnlineStatus(userId))
                .build();
    }
}
