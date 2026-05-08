package com.hic.controller;

import com.hic.service.IsapiProxyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import com.hic.exception.DeviceSyncException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

@RestController
@RequestMapping("/api/devices/{deviceId}/users")
@RequiredArgsConstructor
public class DeviceUserController {

    private final IsapiProxyService isapiProxyService;
    private final RestTemplate restTemplate;

    @Value("${isapi.base-url}")
    private String isapiBaseUrl;

    @PostMapping
    public ResponseEntity<String> createUser(@PathVariable Long deviceId,
                                             @RequestBody(required = false) String body,
                                             HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.POST, "/api/devices/" + deviceId + "/users", request, body);
    }

    @GetMapping
    public ResponseEntity<String> getUsers(@PathVariable Long deviceId, HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.GET, "/api/devices/" + deviceId + "/users", request, null);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<String> getUser(@PathVariable Long deviceId,
                                          @PathVariable Long userId,
                                          HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.GET, "/api/devices/" + deviceId + "/users/" + userId, request, null);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable Long deviceId,
                                             @PathVariable Long userId,
                                             @RequestBody(required = false) String body,
                                             HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.PUT, "/api/devices/" + deviceId + "/users/" + userId, request, body);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long deviceId,
                                             @PathVariable Long userId,
                                             HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.DELETE, "/api/devices/" + deviceId + "/users/" + userId, request, null);
    }

    @PostMapping("/{userId}/sync")
    public ResponseEntity<String> syncUser(@PathVariable Long deviceId,
                                           @PathVariable Long userId,
                                           HttpServletRequest request) {
        return isapiProxyService.forward(HttpMethod.POST, "/api/devices/" + deviceId + "/users/" + userId + "/sync", request, null);
    }

    @PostMapping(path = "/{userId}/face", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFace(@PathVariable Long deviceId,
                                             @PathVariable Long userId,
                                             MultipartHttpServletRequest request) throws IOException {
        String url = trimTrailingSlash(isapiBaseUrl) + "/api/devices/" + deviceId + "/users/" + userId + "/face";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        Iterator<String> fileNames = request.getFileNames();
        while (fileNames.hasNext()) {
            String name = fileNames.next();
            List<MultipartFile> files = request.getFiles(name);
            for (MultipartFile file : files) {
                body.add(name, asResource(file));
            }
        }
        request.getParameterMap().forEach((name, values) -> {
            for (String value : values) {
                body.add(name, value);
            }
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        try {
            ResponseEntity<String> upstream = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            return ResponseEntity.status(upstream.getStatusCode()).headers(upstream.getHeaders()).body(upstream.getBody());
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new DeviceSyncException("ISAPI service is unavailable");
        }
    }

    private ByteArrayResource asResource(MultipartFile file) throws IOException {
        return new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
