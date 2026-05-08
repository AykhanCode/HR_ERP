package com.hic.controller;

import com.hic.repository.UserRepository;
import com.hic.service.IsapiProxyService;
import com.hic.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DeviceUserController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, UserDetailsServiceAutoConfiguration.class}
)
class DeviceUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IsapiProxyService isapiProxyService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @Test
    void getUsers_proxiesToIsapi() throws Exception {
        when(isapiProxyService.forward(eq(HttpMethod.GET), eq("/api/devices/5/users"), any(HttpServletRequest.class), isNull()))
                .thenReturn(ResponseEntity.ok("[{\"id\":\"U1\"}]"));

        mockMvc.perform(get("/api/devices/5/users"))
                .andExpect(status().isOk())
                .andExpect(content().json("[{\"id\":\"U1\"}]"));

        verify(isapiProxyService).forward(eq(HttpMethod.GET), eq("/api/devices/5/users"), any(HttpServletRequest.class), isNull());
    }

    @Test
    void createUser_proxiesRawBodyToIsapi() throws Exception {
        when(isapiProxyService.forward(eq(HttpMethod.POST), eq("/api/devices/5/users"), any(HttpServletRequest.class)))
                .thenReturn(ResponseEntity.ok("{\"id\":\"U1\"}"));

        mockMvc.perform(post("/api/devices/5/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ali\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"id\":\"U1\"}"));

        verify(isapiProxyService).forward(eq(HttpMethod.POST), eq("/api/devices/5/users"), any(HttpServletRequest.class));
    }

    @Test
    void updateUser_proxiesRawBodyToIsapi() throws Exception {
        when(isapiProxyService.forward(eq(HttpMethod.PUT), eq("/api/devices/5/users/99"), any(HttpServletRequest.class)))
                .thenReturn(ResponseEntity.ok("{\"id\":\"99\"}"));

        mockMvc.perform(put("/api/devices/5/users/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ali V2\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"id\":\"99\"}"));

        verify(isapiProxyService).forward(eq(HttpMethod.PUT), eq("/api/devices/5/users/99"), any(HttpServletRequest.class));
    }
}
