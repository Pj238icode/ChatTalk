package com.example.realchatapplication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication

@EnableMongoRepositories(basePackages = "com.example.realchatapplication.repository")

public class RealchatapplicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(RealchatapplicationApplication.class, args);
    }

}
