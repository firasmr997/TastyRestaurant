package com.tasty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TastyApplication {

    public static void main(String[] args) {
        SpringApplication.run(TastyApplication.class, args);
    }
}
