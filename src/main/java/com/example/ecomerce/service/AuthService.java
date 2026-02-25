package com.example.ecomerce.service;

import com.example.ecomerce.dto.reponse.LoginResponse;
import com.example.ecomerce.dto.request.LoginRequest;
import com.example.ecomerce.entity.RedisToken;
import com.example.ecomerce.entity.User;
import com.example.ecomerce.repository.RedisTokenRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RedisTokenRepository redisTokenRepository;

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

    public void logout (String accessToken) throws ParseException {

        SignedJWT signedJWT = SignedJWT.parse(accessToken);
        Date expired = signedJWT.getJWTClaimsSet().getExpirationTime();
        String jwtId = signedJWT.getJWTClaimsSet().getJWTID();

        Date now = new Date();

        Long diff = expired.getTime() - now.getTime();

        RedisToken redisToken = RedisToken.builder()
                .jwtId(jwtId)
                .expiredTime(diff)
                .build();

        redisTokenRepository.save(redisToken);
        log.info("Token saved: {}", accessToken);

    }


}
