package telemetry

import (
	"strings"
	"testing"
	"time"
)

func TestTelemetryCollector(t *testing.T) {
	tc := NewTelemetryCollector()

	tc.IncrementCounter("db_queries", 5)
	tc.IncrementCounter("db_queries", 3)
	tc.SetGauge("memory_mb", 128.5)
	tc.RecordRequest(200, 15*time.Millisecond)
	tc.RecordRequest(500, 45*time.Millisecond)

	snap := tc.Snapshot()

	if snap["requests_total"].(int64) != 2 {
		t.Fatalf("expected 2 requests, got %v", snap["requests_total"])
	}
	if snap["errors_total"].(int64) != 1 {
		t.Fatalf("expected 1 error, got %v", snap["errors_total"])
	}

	counters := snap["counters"].(map[string]int64)
	if counters["db_queries"] != 8 {
		t.Fatalf("expected 8 db_queries, got %v", counters["db_queries"])
	}

	prom := tc.FormatPrometheus()
	if !strings.Contains(prom, "rakta_requests_total 2") {
		t.Fatalf("prometheus format missing requests counter: %s", prom)
	}
}
