package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/RheinSullivan/raktajs/tools/go/internal/repo"
)

func main() {
	projectRoot := "."
	if len(os.Args) > 1 {
		projectRoot = os.Args[1]
	}

	absoluteRoot, resolveError := filepath.Abs(projectRoot)
	if resolveError != nil {
		exitWithError(resolveError)
	}

	report, buildError := repo.BuildAuditReport(absoluteRoot)
	if buildError != nil {
		exitWithError(buildError)
	}

	payload, marshalError := json.MarshalIndent(report, "", "  ")
	if marshalError != nil {
		exitWithError(marshalError)
	}

	fmt.Println(string(payload))
}

func exitWithError(errorToDisplay error) {
	fmt.Fprintf(os.Stderr, "rakta-repo-audit: %v\n", errorToDisplay)
	os.Exit(1)
}
