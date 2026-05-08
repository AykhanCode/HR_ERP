package com.hic.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class IsapiProxyServiceTest {

    private IsapiProxyService service;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        service = new IsapiProxyService(restTemplate);
        ReflectionTestUtils.setField(service, "isapiBaseUrl", "http://host.docker.internal:8080/");
    }

    @Test
    void forward_get_withQuery_passthroughsResponse() {
        server.expect(requestTo("http://host.docker.internal:8080/api/punches?limit=50&deviceId=9"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[{\"id\":1}]", MediaType.APPLICATION_JSON));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setQueryString("limit=50&deviceId=9");
        request.addHeader("Authorization", "Bearer token");

        var response = service.forward(HttpMethod.GET, "/api/punches", request, null);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("[{\"id\":1}]");
        server.verify();
    }

    @Test
    void forward_onUpstreamError_returnsSameStatusAndBody() {
        server.expect(requestTo("http://host.docker.internal:8080/api/devices/11"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withBadRequest().contentType(MediaType.APPLICATION_JSON).body("{\"error\":\"invalid\"}"));

        MockHttpServletRequest request = new MockHttpServletRequest();

        var response = service.forward(HttpMethod.GET, "/api/devices/11", request, null);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo("{\"error\":\"invalid\"}");
        server.verify();
    }

    @Test
    void forward_post_readsRawBodyAndForwardsAsIs() {
        server.expect(requestTo("http://host.docker.internal:8080/api/devices"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Content-Type", "application/json"))
                .andExpect(content().string("{\"ip\":\"10.0.0.5\",\"enabled\":true}"))
                .andRespond(withSuccess("{\"ok\":true}", MediaType.APPLICATION_JSON));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent("{\"ip\":\"10.0.0.5\",\"enabled\":true}".getBytes());

        var response = service.forward(HttpMethod.POST, "/api/devices", request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"ok\":true}");
        server.verify();
    }
}
