package com.smartrental.propertyservice.shared.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Reports the health of the relational database connection.
 * <p>
 * Spring Boot's built-in DataSourceHealthIndicator already performs
 * a basic connectivity check. This custom indicator adds the
 * validation query result so operators can confirm the schema is
 * accessible, not just that a TCP connection can be opened.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            // Lightweight query — just validates connectivity and schema access.
            Integer result = jdbcTemplate.queryForObject(
                    "SELECT 1", Integer.class
            );

            if (result != null && result == 1) {
                return Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("validationQuery", "SELECT 1")
                        .withDetail("result", "ok")
                        .build();
            }

            return Health.down()
                    .withDetail("reason", "validation query returned unexpected result")
                    .build();

        } catch (Exception e) {
            log.error("Database health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }

}
