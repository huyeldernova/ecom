package com.example.ecomerce.config;

import com.example.ecomerce.entity.RedisToken;
import com.example.ecomerce.repository.RedisTokenRepository;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Base64;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class JwtDecoderConfig implements JwtDecoder {

    @Value("${jwt.secret-key}")
    private String secretKey;

    private NimbusJwtDecoder nimbusJwtDecoder = null;
    private final RedisTokenRepository redisTokenRepository;

    @PostConstruct
    public void init() {
        SecretKey secretKeySpec = new SecretKeySpec(
                Base64.getDecoder().decode(secretKey), "HmacSHA256"
        );
        nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }


    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            String jwtId = signedJWT.getJWTClaimsSet().getJWTID();

            Optional<RedisToken> tokenOp = redisTokenRepository.findById(jwtId);
            if (tokenOp.isPresent()) {
                throw new JwtException("client logout");
            }
            return nimbusJwtDecoder.decode(token);
        } catch (ParseException e) {
            {
                throw new RuntimeException(e);
            }
        }
    }
}
