package health

// Status represents the health of a single component.
type Status string

const (
	StatusHealthy   Status = "healthy"
	StatusDegraded  Status = "degraded"
	StatusUnhealthy Status = "unhealthy"
)

// ComponentResult holds the outcome of one health check.
type ComponentResult struct {
	Status  Status `json:"status"`
	Message string `json:"message,omitempty"`
}

// Report is the top-level response returned by the /health endpoint.
type Report struct {
	Status  Status                     `json:"status"`
	Service string                     `json:"service"`
	Version string                     `json:"version,omitempty"`
	Checks  map[string]ComponentResult `json:"checks"`
}

// NewReport builds a Report and derives the overall status from
// the individual component results. The overall status is the worst
// status found across all components.
func NewReport(service, version string, checks map[string]ComponentResult) Report {
	overall := StatusHealthy

	for _, result := range checks {
		if result.Status == StatusUnhealthy {
			overall = StatusUnhealthy
			break
		}
		if result.Status == StatusDegraded && overall == StatusHealthy {
			overall = StatusDegraded
		}
	}

	return Report{
		Status:  overall,
		Service: service,
		Version: version,
		Checks:  checks,
	}
}
