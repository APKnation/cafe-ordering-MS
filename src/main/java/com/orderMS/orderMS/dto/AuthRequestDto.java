package com.orderMS.orderMS.dto;

import com.orderMS.orderMS.model.enums.UserRole;
import lombok.Data;

@Data
public class AuthRequestDto {
    private String username;
    private String password;
    private UserRole role;
}
