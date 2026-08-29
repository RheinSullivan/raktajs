package telemetry

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

// MetricType defines the category of telemetry measurement
type MetricType string

const (
	MetricCounter   MetricType = "COUNTER"
	MetricGauge     MetricType = "GAUGE"
	MetricHistogram MetricType = "HISTOGRAM"
)

// MetricRecord captures a point-in-time runtime measurement
type MetricRecord struct {
	Name      string            `json:"name"`
	Type      MetricType        `json:"type"`
	Value     float64           `json:"value"`
	Tags      map[string]string `json:"tags,omitempty"`
	Timestamp int64             `json:"timestamp"`
}

// TelemetryCollector manages real-time framework statistics
type TelemetryCollector struct {
	mu           sync.RWMutex
	counters     map[string]*int64
	gauges       map[string]float64
	histograms   map[string][]float64
	startTime    time.Time
	requestCount int64
	errorCount   int64
}

// NewTelemetryCollector initializes an isolated collector
func NewTelemetryCollector() *TelemetryCollector {
	return &TelemetryCollector{
		counters:   make(map[string]*int64),
		gauges:     make(map[string]float64),
		histograms: make(map[string][]float64),
		startTime:  time.Now(),
	}
}

// IncrementCounter atomically increments a named counter
func (tc *TelemetryCollector) IncrementCounter(name string, delta int64) int64 {
	tc.mu.Lock()
	ptr, exists := tc.counters[name]
	if !exists {
		var val int64
		tc.counters[name] = &val
		ptr = &val
	}
	tc.mu.Unlock()

	return atomic.AddInt64(ptr, delta)
}

// SetGauge updates a floating point status gauge
func (tc *TelemetryCollector) SetGauge(name string, value float64) {
	tc.mu.Lock()
	defer tc.mu.Unlock()
	tc.gauges[name] = value
}

// RecordTiming logs an operation duration in milliseconds
func (tc *TelemetryCollector) RecordTiming(name string, duration time.Duration) {
	ms := float64(duration.Microseconds()) / 1000.0
	tc.mu.Lock()
	defer tc.mu.Unlock()
	tc.histograms[name] = append(tc.histograms[name], ms)
	if len(tc.histograms[name]) > 1000 {
		tc.histograms[name] = tc.histograms[name][len(tc.histograms[name])-1000:]
	}
}

// RecordRequest tracks inbound HTTP / RPC requests
func (tc *TelemetryCollector) RecordRequest(statusCode int, duration time.Duration) {
	atomic.AddInt64(&tc.requestCount, 1)
	if statusCode >= 400 {
		atomic.AddInt64(&tc.errorCount, 1)
	}
	tc.RecordTiming("http_request_duration_ms", duration)
}

// Snapshot exports current runtime metrics
func (tc *TelemetryCollector) Snapshot() map[string]interface{} {
	tc.mu.RLock()
	defer tc.mu.RUnlock()

	countersCopy := make(map[string]int64, len(tc.counters))
	for k, v := range tc.counters {
		countersCopy[k] = atomic.LoadInt64(v)
	}

	gaugesCopy := make(map[string]float64, len(tc.gauges))
	for k, v := range tc.gauges {
		gaugesCopy[k] = v
	}

	uptimeSeconds := time.Since(tc.startTime).Seconds()
	reqTotal := atomic.LoadInt64(&tc.requestCount)
	errTotal := atomic.LoadInt64(&tc.errorCount)

	var errorRate float64
	if reqTotal > 0 {
		errorRate = float64(errTotal) / float64(reqTotal) * 100.0
	}

	return map[string]interface{}{
		"uptime_seconds": uptimeSeconds,
		"requests_total": reqTotal,
		"errors_total":   errTotal,
		"error_rate_pct": errorRate,
		"counters":       countersCopy,
		"gauges":         gaugesCopy,
	}
}

// FormatPrometheus exports metric points in Prometheus text format
func (tc *TelemetryCollector) FormatPrometheus() string {
	snap := tc.Snapshot()
	return fmt.Sprintf(
		"# HELP rakta_uptime_seconds Total runtime uptime\n# TYPE rakta_uptime_seconds gauge\nrakta_uptime_seconds %.2f\n"+
			"# HELP rakta_requests_total Total requests processed\n# TYPE rakta_requests_total counter\nrakta_requests_total %d\n"+
			"# HELP rakta_errors_total Total errors encountered\n# TYPE rakta_errors_total counter\nrakta_errors_total %d\n",
		snap["uptime_seconds"],
		snap["requests_total"],
		snap["errors_total"],
	)
}
