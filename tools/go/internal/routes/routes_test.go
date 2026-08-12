package routes

import (
	"path/filepath"
	"testing"
)

func TestParseSegmentSupportsNextStyleRoutes(t *testing.T) {
	cases := []struct {
		raw   string
		kind  SegmentKind
		param string
	}{
		{raw: "dashboard", kind: SegmentStatic},
		{raw: "(auth)", kind: SegmentGroup},
		{raw: "[id]", kind: SegmentDynamic, param: "id"},
		{raw: "[...sign-in]", kind: SegmentCatchAll, param: "sign-in"},
		{raw: "[[...slug]]", kind: SegmentOptionalCatchAll, param: "slug"},
	}

	for _, testCase := range cases {
		segment := ParseSegment(testCase.raw)
		if segment.Kind != testCase.kind || segment.Param != testCase.param {
			t.Fatalf("ParseSegment(%q) = %#v", testCase.raw, segment)
		}
	}
}

func TestAnalyzeRouteFileSkipsGroupsAndRouteFiles(t *testing.T) {
	appRoot := filepath.FromSlash("/repo/app")
	filePath := filepath.FromSlash("/repo/app/(auth)/users/[id]/page.tsx")

	pattern := AnalyzeRouteFile(appRoot, filePath)

	if pattern.Path != "/users/:id" {
		t.Fatalf("expected /users/:id, got %s", pattern.Path)
	}
	if len(pattern.Segments) != 3 {
		t.Fatalf("expected 3 route segments, got %#v", pattern.Segments)
	}
}

func TestAnalyzeRouteFileSupportsCatchAll(t *testing.T) {
	appRoot := filepath.FromSlash("/repo/app")
	filePath := filepath.FromSlash("/repo/app/docs/[...slug]/page.tsx")

	pattern := AnalyzeRouteFile(appRoot, filePath)

	if pattern.Path != "/docs/*slug" {
		t.Fatalf("expected /docs/*slug, got %s", pattern.Path)
	}
}
