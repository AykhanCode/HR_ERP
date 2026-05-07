package com.hic.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hic.dto.DeviceSyncDTO;
import com.hic.service.DeviceSyncService;
import com.hic.repository.UserRepository;
import com.hic.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DeviceController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, UserDetailsServiceAutoConfiguration.class}
)
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeviceSyncService deviceSyncService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @Test
    void getAll_withEnabledFilter_returns200() throws Exception {
        DeviceSyncDTO.DeviceConfigDTO dto = new DeviceSyncDTO.DeviceConfigDTO();
        dto.setId(1L);
        dto.setDeviceId("1");
        dto.setDeviceIp("10.0.0.1");
        dto.setStatus("ACTIVE");

        when(deviceSyncService.getAllDevices(eq(true))).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/devices").param("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1));

        verify(deviceSyncService).getAllDevices(true);
    }

    @Test
    void patchEnabled_returns200() throws Exception {
        DeviceSyncDTO.DeviceEnabledDTO request = new DeviceSyncDTO.DeviceEnabledDTO(true);
        DeviceSyncDTO.DeviceConfigDTO response = new DeviceSyncDTO.DeviceConfigDTO();
        response.setId(1L);
        response.setStatus("ACTIVE");

        when(deviceSyncService.updateEnabled(eq(1L), eq(request))).thenReturn(response);

        mockMvc.perform(patch("/api/devices/1/enabled")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        verify(deviceSyncService).updateEnabled(1L, request);
    }

    @Test
    void start_returns200() throws Exception {
        DeviceSyncDTO.DeviceRuntimeDTO response = new DeviceSyncDTO.DeviceRuntimeDTO(1L, true, true, "ACTIVE");
        when(deviceSyncService.startDevice(1L)).thenReturn(response);

        mockMvc.perform(post("/api/devices/1/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.running").value(true));

        verify(deviceSyncService).startDevice(1L);
    }

    @Test
    void status_returns200() throws Exception {
        DeviceSyncDTO.DeviceStatusDTO response = new DeviceSyncDTO.DeviceStatusDTO(1L, true, 200, "ok");
        when(deviceSyncService.getStatus(1L)).thenReturn(response);

        mockMvc.perform(get("/api/devices/1/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.online").value(true));

        verify(deviceSyncService).getStatus(1L);
    }
}
