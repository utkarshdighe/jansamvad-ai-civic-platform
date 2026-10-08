package com.jansamvad.controller;

import com.jansamvad.dto.ComplaintMediaResponse;
import com.jansamvad.service.ComplaintMediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints/{complaintId}/media")
public class ComplaintMediaController {

    private final ComplaintMediaService mediaService;

    public ComplaintMediaController(ComplaintMediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping
    public ResponseEntity<ComplaintMediaResponse> uploadMedia(
            @PathVariable Long complaintId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mediaType", required = false) String mediaType) {
        ComplaintMediaResponse response = mediaService.uploadMedia(complaintId, file, mediaType);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintMediaResponse>> getMedia(@PathVariable Long complaintId) {
        return ResponseEntity.ok(mediaService.getMediaByComplaint(complaintId));
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @PathVariable Long complaintId,
            @PathVariable Long mediaId) {
        mediaService.deleteMedia(complaintId, mediaId);
        return ResponseEntity.noContent().build();
    }
}
