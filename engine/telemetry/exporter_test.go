package telemetry

import (
	"testing"
	"time"
)

func TestBuildOTLPPayload(t *testing.T) {
	tc := NewTelemetryCollector()
	tc.RecordRequest(200, 20*time.Millisecond)
	tc.RecordRequest(200, 30*time.Millisecond)

	exporter := NewExporter("http://localhost:4318/v1/metrics", 2*time.Second)
	payload, err := exporter.BuildOTLPPayload(tc, "my-rakta-production-app")

	if err != nil {
		t.Fatalf("unexpected error building OTLP payload: %v", err)
	}

	if len(payload.ResourceMetrics) == 0 {
		t.Fatal("expected non-empty resource metrics")
	}

	attrs := payload.ResourceMetrics[0].Resource.Attributes
	foundApp := false
	for _, attr := range attrs {
		if attr.Key == "service.name" && attr.Value.StringValue == "my-rakta-production-app" {
			foundApp = true
			break
		}
	}

	if !foundApp {
		t.Fatal("expected service.name attribute to match app name")
	}
}
