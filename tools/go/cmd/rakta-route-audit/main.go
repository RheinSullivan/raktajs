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
	walkError := filepath.WalkDir(appRoot, func(path string, entry os.DirEntry, directoryError error) error {
		if directoryError != nil {
			return directoryError
		}
		if entry.IsDir() {
			return nil
		}
		if entry.Name() == "page.tsx" || entry.Name() == "page.ts" {
			patterns = append(patterns, routes.AnalyzeRouteFile(appRoot, path))
		}
		return nil
	})
	if walkError != nil {
		exitWithError(walkError)
	}

	routes.SortPatterns(patterns)
	payload, marshalError := json.MarshalIndent(patterns, "", "  ")
	if marshalError != nil {
		exitWithError(marshalError)
	}

	fmt.Println(string(payload))
}

func exitWithError(errorToDisplay error) {
	fmt.Fprintf(os.Stderr, "rakta-route-audit: %v\n", errorToDisplay)
	os.Exit(1)
}
