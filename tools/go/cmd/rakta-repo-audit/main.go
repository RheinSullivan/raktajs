package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/RheinSullivan/raktajs/tools/go/internal/repo"
)

func main() {
	root := "."
	if len(os.Args) > 1 {
		root = os.Args[1]
	}

	absoluteRoot, err := filepath.Abs(root)
	if err != nil {
		exitWithError(err)
	}

	report, err := repo.BuildAuditReport(absoluteRoot)
	if err != nil {
		exitWithError(err)
	}

	payload, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		exitWithError(err)
	}

	fmt.Println(string(payload))
}

func exitWithError(err error) {
	fmt.Fprintf(os.Stderr, "rakta-repo-audit: %v\n", err)
	os.Exit(1)
}
