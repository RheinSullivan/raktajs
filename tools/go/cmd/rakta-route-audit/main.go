package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/RheinSullivan/raktajs/tools/go/internal/routes"
)

func main() {
	appRoot := "app"
	if len(os.Args) > 1 {
		appRoot = os.Args[1]
	}

	var patterns []routes.RoutePattern
	err := filepath.WalkDir(appRoot, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			return nil
		}
		if entry.Name() == "page.tsx" || entry.Name() == "page.ts" {
			patterns = append(patterns, routes.AnalyzeRouteFile(appRoot, path))
		}
		return nil
	})
	if err != nil {
		exitWithError(err)
	}

	routes.SortPatterns(patterns)
	payload, err := json.MarshalIndent(patterns, "", "  ")
	if err != nil {
		exitWithError(err)
	}

	fmt.Println(string(payload))
}

func exitWithError(err error) {
	fmt.Fprintf(os.Stderr, "rakta-route-audit: %v\n", err)
	os.Exit(1)
}
