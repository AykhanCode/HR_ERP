package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.DeviceSyncDTO;
import com.hic.model.DeviceConfig;
import com.hic.model.DeviceSyncHistory;
import com.hic.service.DeviceSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceSyncService deviceSyncService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceConfig>>> getAllDevices() {
        List<DeviceConfig> result = deviceSyncService.getAllDevices();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<ApiResponse<List<DeviceConfig>>> getByBranch(@PathVariable Long branchId) {
        List<DeviceConfig> result = deviceSyncService.getDevicesByBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeviceConfig>> getById(@PathVariable Long id) {
        DeviceConfig result = deviceSyncService.getDeviceById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeviceConfig>> createDevice(@RequestBody DeviceConfig device) {
        DeviceConfig result = deviceSyncService.createDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Device registered", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeviceConfig>> updateDevice(
            @PathVariable Long id, @RequestBody DeviceConfig device) {
        DeviceConfig result = deviceSyncService.updateDevice(id, device);
        return ResponseEntity.ok(ApiResponse.success("Device updated", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        deviceSyncService.deleteDevice(id);
        return ResponseEntity.ok(ApiResponse.success("Device deleted", null));
    }

    @PostMapping("/sync/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceSyncDTO>> syncDevice(@PathVariable String deviceId) {
        DeviceSyncDTO result = deviceSyncService.syncDevice(deviceId);
        return ResponseEntity.ok(ApiResponse.success("Sync completed", result));
    }

    @GetMapping("/sync/history/{deviceId}")
    public ResponseEntity<ApiResponse<List<DeviceSyncHistory>>> getSyncHistory(@PathVariable String deviceId) {
        List<DeviceSyncHistory> result = deviceSyncService.getSyncHistory(deviceId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/sync/history/recent")
    public ResponseEntity<ApiResponse<List<DeviceSyncHistory>>> getRecentSyncHistory() {
        List<DeviceSyncHistory> result = deviceSyncService.getRecentSyncHistory();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
