package com.example.ecomerce.config;

import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.text.ParseException;

@Configuration
@RequiredArgsConstructor
public class JwtDecoderConfig implements JwtDecoder {

//    @Value("${jwt.secret-key}")
//    private String secretKey;
//
//    private NimbusJwtDecoder nimbusJwtDecoder = null;
//    private final RedisTokenRepository redisTokenRepository;
//
//    @PostConstruct
//    public void init() {
//        SecretKey secretKeySpec = new SecretKeySpec(
//                Base64.getDecoder().decode(secretKey), "HmacSHA256"
//        );
//        nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
//                .macAlgorithm(MacAlgorithm.HS256)
//                .build();
//    }
//
//
//    @Override
//    public Jwt decode(String token) throws JwtException {
//        try {
//            SignedJWT signedJWT = SignedJWT.parse(token);
//            String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
//
//            Optional<RedisToken> tokenOp = redisTokenRepository.findById(jwtId);
//            if (tokenOp.isPresent()) {
//                throw new JwtException("client logout");
//            }
//            return nimbusJwtDecoder.decode(token);
//        } catch (ParseException e) {
//            {
//                throw new RuntimeException(e);
//            }
//        }
//    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return new Jwt(
                    token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    signedJWT.getJWTClaimsSet().getExpirationTime().toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims()
            );
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
}

