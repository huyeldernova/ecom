package com.example.cartservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.ObjectMapper;


@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private Integer port;

//    @Value("${spring.data.redis.username}")
//    private String username;
//
//    @Value("${spring.data.redis.password}")
//    private String password;

    @Value("${spring.data.redis.ssl.enabled}")
    private boolean sslEnabled;

//    @Bean
//    public LettuceConnectionFactory lettuceConnectionFactory(){
//        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);
//        if(username != null && !username.isEmpty()){
//            redisConfig.setUsername(username);
//        }
//        if(password != null && password.isEmpty()){
//            redisConfig.setPassword(password);
//        }
//
//        LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder();
//
//        if(sslEnabled){
//            clientConfigBuilder.useSsl();
//        }
//
//        return new LettuceConnectionFactory(redisConfig, clientConfigBuilder.build());
//    }

    @Bean
    public LettuceConnectionFactory lettuceConnectionFactory(){
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);
        return new LettuceConnectionFactory(redisConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(ObjectMapper objectMapper){

        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(lettuceConnectionFactory());


        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());

        redisTemplate.setValueSerializer(new GenericJacksonJsonRedisSerializer(objectMapper));
        redisTemplate.setHashValueSerializer(new GenericJacksonJsonRedisSerializer(objectMapper));

        return redisTemplate;

    }
}
