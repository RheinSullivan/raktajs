package routes

import (
	"path/filepath"
	"sort"
	"strings"
)

type SegmentKind string

const (
	SegmentStatic           SegmentKind = "static"
	SegmentGroup            SegmentKind = "group"
	SegmentDynamic          SegmentKind = "dynamic"
	SegmentCatchAll         SegmentKind = "catchAll"
	SegmentOptionalCatchAll SegmentKind = "optionalCatchAll"
)

type RouteSegment struct {
	Raw   string      `json:"raw"`
	Name  string      `json:"name"`
	Kind  SegmentKind `json:"kind"`
	Param string      `json:"param,omitempty"`
}

type RoutePattern struct {
	File     string         `json:"file"`
	Path     string         `json:"path"`
	Segments []RouteSegment `json:"segments"`
}

func AnalyzeRouteFile(appRoot string, filePath string) RoutePattern {
	relativePath, err := filepath.Rel(appRoot, filePath)
	if err != nil {
		relativePath = filePath
	}

	parts := splitRouteParts(filepath.ToSlash(relativePath))
	segments := make([]RouteSegment, 0, len(parts))
	publicParts := make([]string, 0, len(parts))

	for _, part := range parts {
		if part == "" || part == "page" || part == "layout" || part == "loading" || part == "error" || part == "not-found" {
			continue
		}

		segment := ParseSegment(part)
		segments = append(segments, segment)
		if segment.Kind != SegmentGroup {
			publicParts = append(publicParts, routePathPart(segment))
		}
	}

	routePath := "/" + strings.Join(publicParts, "/")
	if routePath != "/" {
		routePath = strings.ReplaceAll(routePath, "//", "/")
	}

	return RoutePattern{
		File:     filepath.ToSlash(relativePath),
		Path:     routePath,
		Segments: segments,
	}
}

func ParseSegment(raw string) RouteSegment {
	segment := RouteSegment{Raw: raw, Name: raw, Kind: SegmentStatic}

	if strings.HasPrefix(raw, "(") && strings.HasSuffix(raw, ")") {
		segment.Kind = SegmentGroup
		segment.Name = strings.TrimSuffix(strings.TrimPrefix(raw, "("), ")")
		return segment
	}

	if strings.HasPrefix(raw, "[[...") && strings.HasSuffix(raw, "]]") {
		segment.Kind = SegmentOptionalCatchAll
		segment.Param = strings.TrimSuffix(strings.TrimPrefix(raw, "[[..."), "]]")
		segment.Name = segment.Param
		return segment
	}

	if strings.HasPrefix(raw, "[...") && strings.HasSuffix(raw, "]") {
		segment.Kind = SegmentCatchAll
		segment.Param = strings.TrimSuffix(strings.TrimPrefix(raw, "[..."), "]")
		segment.Name = segment.Param
		return segment
	}

	if strings.HasPrefix(raw, "[") && strings.HasSuffix(raw, "]") {
		segment.Kind = SegmentDynamic
		segment.Param = strings.TrimSuffix(strings.TrimPrefix(raw, "["), "]")
		segment.Name = segment.Param
		return segment
	}

	return segment
}

func SortPatterns(patterns []RoutePattern) {
	sort.Slice(patterns, func(i, j int) bool {
		return patterns[i].Path < patterns[j].Path
	})
}

func splitRouteParts(relativePath string) []string {
	withoutExtension := strings.TrimSuffix(relativePath, filepath.Ext(relativePath))
	return strings.Split(withoutExtension, "/")
}

func routePathPart(segment RouteSegment) string {
	switch segment.Kind {
	case SegmentDynamic:
		return ":" + segment.Param
	case SegmentCatchAll:
		return "*" + segment.Param
	case SegmentOptionalCatchAll:
		return "*" + segment.Param + "?"
	default:
		return segment.Raw
	}
}
