package com.example.ecomerce.service;

import com.example.ecomerce.dto.JwtInfo;
import com.example.ecomerce.dto.reponse.TokenVerificationResponse;
import com.example.ecomerce.entity.RedisToken;
import com.example.ecomerce.enums.TokenType;
import com.example.ecomerce.exception.AppException;
import com.example.ecomerce.exception.ErrorCode;
import com.example.ecomerce.repository.RedisTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static com.example.ecomerce.constant.AuthConstant.AUTHORITIES;
import static com.example.ecomerce.constant.AuthConstant.TOKEN_TYPE;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final RedisTokenRepository redisTokenRepository;

    @Value("${jwt.secret-key}")
    private String secretKey;

    private byte[] getSecretKey() {
        return Base64.getDecoder().decode(secretKey);
    }

    public String generateAccessToken(String userId, List<String> authorities) throws JOSEException {
        // header
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        //payload
        Date now = new Date();
        Date expirationTime = Date.from(now.toInstant().plus(30, ChronoUnit.MINUTES));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(userId)
                .issueTime(now)
                .expirationTime(expirationTime)
                .claim(AUTHORITIES, authorities)
                .claim(TOKEN_TYPE, TokenType.ACCESS_TOKEN)
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject =new JWSObject(header, payload);

        //signature
        jwsObject.sign(new MACSigner(getSecretKey()));

        return jwsObject.serialize();

    }

    public String generateRefreshToken(String userId) throws JOSEException {
        // header
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        //payload
        Date now = new Date();
        Date expirationTime = Date.from(now.toInstant().plus(60, ChronoUnit.MINUTES));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(userId)
                .issueTime(now)
                .expirationTime(expirationTime)
                .claim(TOKEN_TYPE, TokenType.REFRESH_TOKEN)
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject =new JWSObject(header, payload);

        //signature
        jwsObject.sign(new MACSigner(getSecretKey()));

        return jwsObject.serialize();

    }

    public TokenVerificationResponse verifyToken(String token) throws ParseException, JOSEException {

        SignedJWT signedJwt = SignedJWT.parse(token);

        boolean isValid = signedJwt.verify(new MACVerifier(getSecretKey()));
        if(!isValid){
            return TokenVerificationResponse.builder()
                    .isValid(false)
                    .reason("INVALID_SIGNATURE")
                    .build();
        }

        Date expiredTime = signedJwt.getJWTClaimsSet().getExpirationTime();
        if(expiredTime.before(new Date())) {
            return TokenVerificationResponse.builder()
                    .isValid(false)
                    .reason("TOKEN_EXPIRED")
                    .build();
        }

        TokenType tokenType = TokenType.valueOf((String) signedJwt.getJWTClaimsSet().getClaim(TOKEN_TYPE));
        if(tokenType != TokenType.ACCESS_TOKEN){
            return TokenVerificationResponse.builder()
                    .isValid(false)
                    .reason("WRONG_TOKEN_TYPE")
                    .build();
        }

        String jwtId = signedJwt.getJWTClaimsSet().getJWTID();
        Optional<RedisToken> redisToken = redisTokenRepository.findById(jwtId);
        if(redisToken.isPresent()) {
            return TokenVerificationResponse.builder()
                    .isValid(false)
                    .reason("TOKEN_BLACKLISTED")
                    .build();
        }

        Object claim =  signedJwt.getJWTClaimsSet().getClaim(AUTHORITIES);
        return TokenVerificationResponse.builder()
                .isValid(true)
                .authorities(extractAuthorities(claim))
                .build();
    }

    private List<String> extractAuthorities(Object authorities) {
        if(authorities == null) {
            return new ArrayList<>();
        }

        if(authorities instanceof List<?> authoritiesList) {
            return authoritiesList.stream()
                    .map(String::valueOf)
                    .toList();
        }
        return Collections.emptyList();
    }


    public JwtInfo parseToken (String token) throws ParseException {

        SignedJWT signedJwt = SignedJWT.parse(token);
        String jwtId = signedJwt.getJWTClaimsSet().getJWTID();
        Date issueTime = signedJwt.getJWTClaimsSet().getIssueTime();
        Date expirationTime = signedJwt.getJWTClaimsSet().getExpirationTime();

        return JwtInfo.builder()
                .jwtId(jwtId)
                .issueTime(issueTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .expirationTime(expirationTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .build();

    }


}
