package com.example.ecomerce.service;

import com.example.ecomerce.dto.reponse.LoginResponse;
import com.example.ecomerce.dto.request.LoginRequest;
import com.example.ecomerce.entity.User;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) throws JOSEException {

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        User user = (User) authentication.getPrincipal();

        List<String> authorities = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String accessToken = jwtService.generateAccessToken(user.getId(), authorities);
        String refreshToken = jwtService.generateRefreshToken(user.getId());


        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .authorities(authorities)
                .build();
    }


}
