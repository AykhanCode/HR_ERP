package com.hic.service;

import com.hic.dto.DeviceSyncDTO;
import com.hic.exception.DeviceSyncException;
import com.hic.exception.UpstreamApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeviceSyncService {

    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String INACTIVE_STATUS = "INACTIVE";

    private final RestTemplate restTemplate;

    @Value("${isapi.base-url:http://host.docker.internal:8080}")
    private String isapiBaseUrl;

    public List<DeviceSyncDTO.DeviceConfigDTO> getAllDevices(Boolean enabled) {
        String url = UriComponentsBuilder
                .fromHttpUrl(baseDevicesUrl())
                .queryParamIfPresent("enabled", Optional.ofNullable(enabled))
                .toUriString();
        List<DeviceSyncDTO.IsapiDeviceResponse> devices = exchangeForList(url, HttpMethod.GET);
        return devices.stream().map(this::toConfigDTO).toList();
    }

    public DeviceSyncDTO.DeviceConfigDTO getDeviceById(Long id) {
        return toConfigDTO(exchangeForObject(deviceUrl(id), HttpMethod.GET, null, DeviceSyncDTO.IsapiDeviceResponse.class));
    }

    public DeviceSyncDTO.DeviceConfigDTO createDevice(DeviceSyncDTO.DeviceConfigDTO dto) {
        DeviceSyncDTO.IsapiDeviceUpsertRequest request = toIsapiUpsertRequest(dto);
        return toConfigDTO(exchangeForObject(baseDevicesUrl(), HttpMethod.POST, request, DeviceSyncDTO.IsapiDeviceResponse.class));
    }

    public DeviceSyncDTO.DeviceConfigDTO updateDevice(Long id, DeviceSyncDTO.DeviceConfigDTO dto) {
        DeviceSyncDTO.IsapiDeviceUpsertRequest request = toIsapiUpsertRequest(dto);
        return toConfigDTO(exchangeForObject(deviceUrl(id), HttpMethod.PUT, request, DeviceSyncDTO.IsapiDeviceResponse.class));
    }

    public DeviceSyncDTO.DeviceConfigDTO updateEnabled(Long id, DeviceSyncDTO.DeviceEnabledDTO dto) {
        DeviceSyncDTO.IsapiDeviceEnabledRequest request = new DeviceSyncDTO.IsapiDeviceEnabledRequest(dto.isEnabled());
        return toConfigDTO(exchangeForObject(deviceEnabledUrl(id), HttpMethod.PATCH, request, DeviceSyncDTO.IsapiDeviceResponse.class));
    }

    public void deleteDevice(Long id) {
        exchange(deviceUrl(id), HttpMethod.DELETE, null);
    }

    public DeviceSyncDTO.DeviceRuntimeDTO startDevice(Long id) {
        return toRuntimeDTO(exchangeForObject(deviceStartUrl(id), HttpMethod.POST, null, DeviceSyncDTO.IsapiDeviceRuntimeResponse.class));
    }

    public DeviceSyncDTO.DeviceRuntimeDTO stopDevice(Long id) {
        return toRuntimeDTO(exchangeForObject(deviceStopUrl(id), HttpMethod.POST, null, DeviceSyncDTO.IsapiDeviceRuntimeResponse.class));
    }

    public DeviceSyncDTO.DeviceStatusDTO getStatus(Long id) {
        DeviceSyncDTO.IsapiDeviceStatusResponse response = exchangeForObject(deviceStatusUrl(id), HttpMethod.GET, null, DeviceSyncDTO.IsapiDeviceStatusResponse.class);
        return new DeviceSyncDTO.DeviceStatusDTO(response.getId(), response.isOnline(), response.getStatusCode(), response.getResponseSnippet());
    }

    public DeviceSyncDTO.SyncResultDTO syncDevice(Long id) {
        DeviceSyncDTO.DeviceRuntimeDTO runtime = startDevice(id);
        return new DeviceSyncDTO.SyncResultDTO(
                runtime.isRunning(),
                runtime.isRunning() ? "Device stream started" : "Device stream is not running",
                0
        );
    }

    private DeviceSyncDTO.DeviceConfigDTO toConfigDTO(DeviceSyncDTO.IsapiDeviceResponse response) {
        DeviceSyncDTO.DeviceConfigDTO dto = new DeviceSyncDTO.DeviceConfigDTO();
        dto.setId(response.getId());
        dto.setDeviceId(String.valueOf(response.getId()));
        dto.setDeviceName(response.getName());
        dto.setDeviceIp(response.getIp());
        dto.setUsername(response.getUsername());
        dto.setStatus(response.isEnabled() ? ACTIVE_STATUS : INACTIVE_STATUS);
        return dto;
    }

    private DeviceSyncDTO.DeviceRuntimeDTO toRuntimeDTO(DeviceSyncDTO.IsapiDeviceRuntimeResponse response) {
        DeviceSyncDTO.DeviceRuntimeDTO dto = new DeviceSyncDTO.DeviceRuntimeDTO();
        dto.setId(response.getId());
        dto.setEnabled(response.isEnabled());
        dto.setRunning(response.isRunning());
        dto.setStatus(response.isRunning() ? ACTIVE_STATUS : INACTIVE_STATUS);
        return dto;
    }

    private DeviceSyncDTO.IsapiDeviceUpsertRequest toIsapiUpsertRequest(DeviceSyncDTO.DeviceConfigDTO dto) {
        DeviceSyncDTO.IsapiDeviceUpsertRequest request = new DeviceSyncDTO.IsapiDeviceUpsertRequest();
        request.setIp(dto.getDeviceIp());
        request.setUsername(dto.getUsername());
        request.setPassword(StringUtils.hasText(dto.getPassword()) ? dto.getPassword() : null);
        request.setName(dto.getDeviceName());
        request.setEnabled(toEnabled(dto.getStatus()));
        return request;
    }

    private Boolean toEnabled(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        return ACTIVE_STATUS.equalsIgnoreCase(status);
    }

    private String baseDevicesUrl() {
        return trimTrailingSlash(isapiBaseUrl) + "/api/devices";
    }

    private String deviceUrl(Long id) {
        return baseDevicesUrl() + "/" + id;
    }

    private String deviceEnabledUrl(Long id) {
        return deviceUrl(id) + "/enabled";
    }

    private String deviceStartUrl(Long id) {
        return deviceUrl(id) + "/start";
    }

    private String deviceStopUrl(Long id) {
        return deviceUrl(id) + "/stop";
    }

    private String deviceStatusUrl(Long id) {
        return deviceUrl(id) + "/status";
    }

    private String trimTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private void exchange(String url, HttpMethod method, Object body) {
        exchangeForObject(url, method, body, Void.class);
    }

    private <T> T exchangeForObject(String url, HttpMethod method, Object body, Class<T> responseType) {
        try {
            HttpEntity<?> entity = body == null ? HttpEntity.EMPTY : new HttpEntity<>(body);
            ResponseEntity<T> response = restTemplate.exchange(url, method, entity, responseType);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw new UpstreamApiException(ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new DeviceSyncException("ISAPI service is unavailable");
        }
    }

    private List<DeviceSyncDTO.IsapiDeviceResponse> exchangeForList(String url, HttpMethod method) {
        try {
            ResponseEntity<List<DeviceSyncDTO.IsapiDeviceResponse>> response = restTemplate.exchange(
                    url,
                    method,
                    HttpEntity.EMPTY,
                    new ParameterizedTypeReference<>() {
                    }
            );
            return response.getBody() == null ? Collections.emptyList() : response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw new UpstreamApiException(ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new DeviceSyncException("ISAPI service is unavailable");
        }
    }
}
