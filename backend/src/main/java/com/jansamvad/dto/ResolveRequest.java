package com.jansamvad.dto;

import jakarta.validation.constraints.NotBlank;

public class ResolveRequest {
    @NotBlank(message = "Resolution note is required")
    private String resolutionNote;
    private String afterPhotoUrl;

    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public String getAfterPhotoUrl() { return afterPhotoUrl; }
    public void setAfterPhotoUrl(String afterPhotoUrl) { this.afterPhotoUrl = afterPhotoUrl; }
}
