package com.example.notificationservice.config;

import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.text.ParseException;
import java.time.Instant;

@Configuration
@RequiredArgsConstructor
public class JwtDecoderConfig implements JwtDecoder {

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            Instant expiry = signedJWT.getJWTClaimsSet().getExpirationTime() != null
                    ? signedJWT.getJWTClaimsSet().getExpirationTime().toInstant()
                    : Instant.now().plusSeconds(1800);

            return new Jwt(
                    token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    expiry,
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims()
            );
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
}
