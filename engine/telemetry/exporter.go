package telemetry

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// OTLPMetricPayload formats metrics for OpenTelemetry Protocol ingestors
type OTLPMetricPayload struct {
	ResourceMetrics []OTLPResourceMetric `json:"resourceMetrics"`
}

type OTLPResourceMetric struct {
	Resource     OTLPResource     `json:"resource"`
	ScopeMetrics []OTLPScopeMetric `json:"scopeMetrics"`
}

type OTLPResource struct {
	Attributes []OTLPAttribute `json:"attributes"`
}

type OTLPAttribute struct {
	Key   string          `json:"key"`
	Value OTLPStringValue `json:"value"`
}

type OTLPStringValue struct {
	StringValue string `json:"stringValue"`
}

type OTLPScopeMetric struct {
	Scope   OTLPScope    `json:"scope"`
	Metrics []OTLPMetric `json:"metrics"`
}

type OTLPScope struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type OTLPMetric struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Unit        string      `json:"unit"`
	Gauge       *OTLPGauge  `json:"gauge,omitempty"`
	Sum         *OTLPSum    `json:"sum,omitempty"`
}

type OTLPGauge struct {
	DataPoints []OTLPDataPoint `json:"dataPoints"`
}

type OTLPSum struct {
	DataPoints             []OTLPDataPoint `json:"dataPoints"`
	AggregationTemporality int             `json:"aggregationTemporality"`
	IsMonotonic            bool            `json:"isMonotonic"`
}

type OTLLPDataPoint struct {
	TimeUnixNano string  `json:"timeUnixNano"`
	AsDouble     float64 `json:"asDouble"`
}

// OTLPDataPoint is an alias for data point representation
type OTLPDataPoint = OTLLPDataPoint

// Exporter dispatches framework telemetry to external monitoring collectors
type Exporter struct {
	endpoint string
	client   *http.Client
}

// NewExporter constructs a telemetry forwarder
func NewExporter(endpoint string, timeout time.Duration) *Exporter {
	return &Exporter{
		endpoint: endpoint,
		client:   &http.Client{Timeout: timeout},
	}
}

// BuildOTLPPayload transforms a collector snapshot into standard OTLP JSON
func (e *Exporter) BuildOTLPPayload(collector *TelemetryCollector, appName string) (*OTLPMetricPayload, error) {
	snap := collector.Snapshot()
	nowNano := fmt.Sprintf("%d", time.Now().UnixNano())

	metrics := make([]OTLPMetric, 0)

	// Uptime Gauge
	if uptime, ok := snap["uptime_seconds"].(float64); ok {
		metrics = append(metrics, OTLPMetric{
			Name:        "rakta.runtime.uptime",
			Description: "Total runtime uptime in seconds",
			Unit:        "s",
			Gauge: &OTLPGauge{
				DataPoints: []OTLPDataPoint{
					{TimeUnixNano: nowNano, AsDouble: uptime},
				},
			},
		})
	}

	// Requests Total Counter
	if reqs, ok := snap["requests_total"].(int64); ok {
		metrics = append(metrics, OTLPMetric{
			Name:        "rakta.requests.total",
			Description: "Total requests processed by Rakta engine",
			Unit:        "1",
			Sum: &OTLPSum{
				DataPoints: []OTLPDataPoint{
					{TimeUnixNano: nowNano, AsDouble: float64(reqs)},
				},
				AggregationTemporality: 2, // Cumulative
				IsMonotonic:            true,
			},
		})
	}

	payload := &OTLPMetricPayload{
		ResourceMetrics: []OTLPResourceMetric{
			{
				Resource: OTLPResource{
					Attributes: []OTLPAttribute{
						{Key: "service.name", Value: OTLPStringValue{StringValue: appName}},
						{Key: "framework", Value: OTLPStringValue{StringValue: "Rakta.js"}},
					},
				},
				ScopeMetrics: []OTLPScopeMetric{
					{
						Scope: OTLPScope{
							Name:    "io.raktajs.telemetry",
							Version: "1.2.2",
						},
						Metrics: metrics,
					},
				},
			},
		},
	}

	return payload, nil
}

// ExportJSON sends JSON-encoded telemetry to an HTTP endpoint
func (e *Exporter) ExportJSON(collector *TelemetryCollector, appName string) error {
	payload, err := e.BuildOTLPPayload(collector, appName)
	if err != nil {
		return err
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", e.endpoint, bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := e.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("telemetry exporter received non-success HTTP status %d", resp.StatusCode)
	}

	return nil
}
