package repo

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type PackageManifest struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Path    string `json:"path"`
}

type LanguageStat struct {
	Language string  `json:"language"`
	Files    int     `json:"files"`
	Bytes    int64   `json:"bytes"`
	Percent  float64 `json:"percent"`
}

type AuditReport struct {
	Root      string            `json:"root"`
	Packages  []PackageManifest `json:"packages"`
	Languages []LanguageStat    `json:"languages"`
}

var languageByExtension = map[string]string{
	".css":  "CSS",
	".go":   "Go",
	".js":   "JavaScript",
	".json": "JSON",
	".md":   "Markdown",
	".rb":   "Ruby",
	".ts":   "TypeScript",
	".tsx":  "TypeScript",
	".yml":  "YAML",
	".yaml": "YAML",
}

var ignoredDirectories = map[string]bool{
	".git":         true,
	".tmp":         true,
	"dist":         true,
	"node_modules": true,
}

func BuildAuditReport(root string) (AuditReport, error) {
	if strings.TrimSpace(root) == "" {
		return AuditReport{}, errors.New("root path is required")
	}

	packages, err := FindPackageManifests(root)
	if err != nil {
		return AuditReport{}, err
	}

	languages, err := CountLanguages(root)
	if err != nil {
		return AuditReport{}, err
	}

	return AuditReport{
		Root:      root,
		Packages:  packages,
		Languages: languages,
	}, nil
}

func FindPackageManifests(root string) ([]PackageManifest, error) {
	var manifests []PackageManifest

	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}

		if entry.IsDir() {
			if ignoredDirectories[entry.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		if entry.Name() != "package.json" {
			return nil
		}

		manifest, err := readPackageManifest(root, path)
		if err != nil {
			return err
		}
		if manifest.Name != "" {
			manifests = append(manifests, manifest)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(manifests, func(i, j int) bool {
		return manifests[i].Path < manifests[j].Path
	})
	return manifests, nil
}

func CountLanguages(root string) ([]LanguageStat, error) {
	type aggregate struct {
		files int
		bytes int64
	}

	stats := map[string]aggregate{}
	var totalBytes int64

	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}

		if entry.IsDir() {
			if ignoredDirectories[entry.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		language := languageByExtension[strings.ToLower(filepath.Ext(entry.Name()))]
		if language == "" {
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}

		current := stats[language]
		current.files++
		current.bytes += info.Size()
		stats[language] = current
		totalBytes += info.Size()
		return nil
	})
	if err != nil {
		return nil, err
	}

	result := make([]LanguageStat, 0, len(stats))
	for language, item := range stats {
		percent := 0.0
		if totalBytes > 0 {
			percent = (float64(item.bytes) / float64(totalBytes)) * 100
		}
		result = append(result, LanguageStat{
			Language: language,
			Files:    item.files,
			Bytes:    item.bytes,
			Percent:  percent,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].Bytes == result[j].Bytes {
			return result[i].Language < result[j].Language
		}
		return result[i].Bytes > result[j].Bytes
	})
	return result, nil
}

func readPackageManifest(root string, path string) (PackageManifest, error) {
	type rawManifest struct {
		Name    string `json:"name"`
		Version string `json:"version"`
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return PackageManifest{}, err
	}

	var manifest rawManifest
	if err := json.Unmarshal(content, &manifest); err != nil {
		return PackageManifest{}, err
	}

	relativePath, err := filepath.Rel(root, path)
	if err != nil {
		relativePath = path
	}

	return PackageManifest{
		Name:    manifest.Name,
		Version: manifest.Version,
		Path:    filepath.ToSlash(relativePath),
	}, nil
}
