package com.jansamvad.service;

import com.jansamvad.dto.ComplaintMediaResponse;
import com.jansamvad.entity.ComplaintEntity;
import com.jansamvad.entity.ComplaintMediaEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.ComplaintMediaRepository;
import com.jansamvad.repository.ComplaintRepository;
import com.jansamvad.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintMediaService {

    private final ComplaintMediaRepository mediaRepository;
    private final ComplaintRepository complaintRepository;
    private final SecurityUtils securityUtils;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/quicktime", "video/webm"
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public ComplaintMediaService(ComplaintMediaRepository mediaRepository,
                                  ComplaintRepository complaintRepository,
                                  SecurityUtils securityUtils) {
        this.mediaRepository = mediaRepository;
        this.complaintRepository = complaintRepository;
        this.securityUtils = securityUtils;
    }

    public ComplaintMediaResponse uploadMedia(Long complaintId, MultipartFile file, String mediaType) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        // Authorization: citizen can upload to own complaint, authority can upload to any, workforce if assigned
        boolean isOwner = complaint.getCitizenId().equals(currentUser.getId());
        boolean isAuthority = currentUser.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        boolean isAssignedWorker = complaint.getAssignedWorkerId() != null
                && complaint.getAssignedWorkerId().equals(currentUser.getId());
        if (!isOwner && !isAuthority && !isAssignedWorker) {
            throw new IllegalArgumentException("You are not authorized to upload media to this complaint");
        }

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum of 50MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType + ". Allowed: JPEG, PNG, GIF, WebP, MP4, QuickTime, WebM");
        }

        // Generate safe unique filename
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        String safeFileName = UUID.randomUUID().toString() + extension;

        // Determine subdirectory based on media type
        String subDir = mediaType != null ? mediaType : "general";
        Path dirPath = Paths.get(uploadDir, "complaints", String.valueOf(complaintId), subDir);
        try {
            Files.createDirectories(dirPath);
            Path filePath = dirPath.resolve(safeFileName);
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        String storedPath = "complaints/" + complaintId + "/" + subDir + "/" + safeFileName;

        ComplaintMediaEntity media = new ComplaintMediaEntity();
        media.setComplaint(complaint);
        media.setFilePath(storedPath);
        media.setMediaType(mediaType != null ? mediaType : contentType.startsWith("image/") ? "image" : "video");
        media.setOriginalName(originalName != null ? originalName : safeFileName);
        media.setFileSize(file.getSize());

        ComplaintMediaEntity saved = mediaRepository.save(media);
        return toResponse(saved);
    }

    public List<ComplaintMediaResponse> getMediaByComplaint(Long complaintId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        // Authorization check
        boolean isOwner = complaint.getCitizenId().equals(currentUser.getId());
        boolean isAuthority = currentUser.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        boolean isAssignedWorker = complaint.getAssignedWorkerId() != null
                && complaint.getAssignedWorkerId().equals(currentUser.getId());
        if (!isOwner && !isAuthority && !isAssignedWorker) {
            throw new IllegalArgumentException("You are not authorized to view media for this complaint");
        }

        return mediaRepository.findByComplaintId(complaintId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteMedia(Long complaintId, Long mediaId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        boolean isOwner = complaint.getCitizenId().equals(currentUser.getId());
        boolean isAuthority = currentUser.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        if (!isOwner && !isAuthority) {
            throw new IllegalArgumentException("You are not authorized to delete media from this complaint");
        }

        ComplaintMediaEntity media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + mediaId));

        if (!media.getComplaint().getId().equals(complaintId)) {
            throw new IllegalArgumentException("Media does not belong to complaint " + complaintId);
        }

        // Delete file from disk
        try {
            Path filePath = Paths.get(uploadDir, media.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't block deletion of metadata
        }

        mediaRepository.delete(media);
    }

    private ComplaintMediaResponse toResponse(ComplaintMediaEntity m) {
        return new ComplaintMediaResponse(
                m.getId(),
                m.getComplaint().getId(),
                "/uploads/" + m.getFilePath(),
                m.getMediaType(),
                m.getOriginalName(),
                m.getFileSize(),
                m.getCreatedAt()
        );
    }
}
