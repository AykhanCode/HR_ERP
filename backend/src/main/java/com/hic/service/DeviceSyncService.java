package com.hic.service;

import com.hic.dto.DeviceSyncDTO;
import com.hic.exception.DeviceSyncException;
import com.hic.exception.ResourceNotFoundException;
import com.hic.model.AttendanceLog;
import com.hic.model.DeviceConfig;
import com.hic.model.DeviceSyncHistory;
import com.hic.model.DeviceSyncHistory.SyncStatus;
import com.hic.repository.AttendanceLogRepository;
import com.hic.repository.DeviceConfigRepository;
import com.hic.repository.DeviceSyncHistoryRepository;
import com.hic.util.HikvisionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceSyncService {

    private final DeviceConfigRepository deviceConfigRepository;
    private final DeviceSyncHistoryRepository syncHistoryRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final HikvisionUtil hikvisionUtil;

    public List<DeviceConfig> getAllDevices() {
        return deviceConfigRepository.findAll(Sort.by("deviceName"));
    }

    public List<DeviceConfig> getDevicesByBranch(Long branchId) {
        return deviceConfigRepository.findByBranchId(branchId);
    }

    public DeviceConfig getDeviceById(Long id) {
        return deviceConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceConfig", id));
    }

    @Transactional
    public DeviceConfig createDevice(DeviceConfig device) {
        deviceConfigRepository.findByDeviceId(device.getDeviceId()).ifPresent(d -> {
            throw new DeviceSyncException("Device already registered with ID: " + device.getDeviceId());
        });
        device.setStatus("ACTIVE");
        return deviceConfigRepository.save(device);
    }

    @Transactional
    public DeviceConfig updateDevice(Long id, DeviceConfig updated) {
        DeviceConfig existing = deviceConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceConfig", id));
        existing.setDeviceName(updated.getDeviceName());
        existing.setDeviceIp(updated.getDeviceIp());
        existing.setDevicePort(updated.getDevicePort());
        existing.setUsername(updated.getUsername());
        existing.setBranchId(updated.getBranchId());
        existing.setStatus(updated.getStatus());
        return deviceConfigRepository.save(existing);
    }

    @Transactional
    public void deleteDevice(Long id) {
        if (!deviceConfigRepository.existsById(id)) {
            throw new ResourceNotFoundException("DeviceConfig", id);
        }
        deviceConfigRepository.deleteById(id);
    }

    @Transactional
    public DeviceSyncDTO syncDevice(String deviceId) {
        DeviceConfig device = deviceConfigRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new DeviceSyncException("Device not found: " + deviceId));

        DeviceSyncHistory history = new DeviceSyncHistory();
        history.setDeviceId(deviceId);
        history.setSyncStartTime(LocalDateTime.now());

        try {
            int recordsSynced = performSync(device);
            history.setSyncEndTime(LocalDateTime.now());
            history.setRecordsSynced(recordsSynced);
            history.setSyncStatus(SyncStatus.SUCCESS);
            device.setLastSyncTime(LocalDateTime.now());
            deviceConfigRepository.save(device);
            syncHistoryRepository.save(history);
            return new DeviceSyncDTO(deviceId, "SUCCESS", recordsSynced, null);
        } catch (Exception e) {
            history.setSyncEndTime(LocalDateTime.now());
            history.setRecordsSynced(0);
            history.setSyncStatus(SyncStatus.FAILED);
            history.setErrorMessage(e.getMessage());
            syncHistoryRepository.save(history);
            log.error("Device sync failed for {}: {}", deviceId, e.getMessage());
            throw new DeviceSyncException("Sync failed for device " + deviceId + ": " + e.getMessage());
        }
    }

    public List<DeviceSyncHistory> getSyncHistory(String deviceId) {
        return syncHistoryRepository.findByDeviceId(deviceId);
    }

    public List<DeviceSyncHistory> getRecentSyncHistory() {
        return syncHistoryRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public Page<DeviceSyncHistory> getSyncHistoryPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return syncHistoryRepository.findAll(pageable);
    }

    private int performSync(DeviceConfig device) {
        int port = device.getDevicePort() != null ? device.getDevicePort() : 80;
        String url = hikvisionUtil.buildAttendanceSearchUrl(device.getDeviceIp(), port);
        log.info("Syncing device {} at {}", device.getDeviceId(), url);
        // In a real implementation this would make HTTP calls to the Hikvision ISAPI
        // For now we return 0 to indicate no records pulled (device not reachable in dev)
        return 0;
    }
}
