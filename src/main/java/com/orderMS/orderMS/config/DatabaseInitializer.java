package com.orderMS.orderMS.config;

import com.orderMS.orderMS.model.User;
import com.orderMS.orderMS.model.enums.UserRole;
import com.orderMS.orderMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String superAdminEmail = "atanasikafuka@gmail.com";
        if (userRepository.findByUsername(superAdminEmail).isEmpty()) {
            User superAdmin = User.builder()
                    .username(superAdminEmail)
                    .password(passwordEncoder.encode("1234"))
                    .role(UserRole.ROLE_ADMIN)
                    .build();
            userRepository.save(superAdmin);
            System.out.println("Super admin user created successfully: " + superAdminEmail);
        }
    }
}
