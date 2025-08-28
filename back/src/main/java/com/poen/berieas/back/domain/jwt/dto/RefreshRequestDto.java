package com.poen.berieas.back.domain.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshRequestDto {
    
    @NotBlank
    private String refreshToken;
}
