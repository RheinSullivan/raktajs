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

var languageByExtensionMap = map[string]string{
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

var ignoredDirectoryNames = map[string]bool{
	".git":         true,
	".tmp":         true,
	"dist":         true,
	"node_modules": true,
}

func BuildAuditReport(root string) (AuditReport, error) {
	if strings.TrimSpace(root) == "" {
		return AuditReport{}, errors.New("root path is required")
	}

	packages, packageError := FindPackageManifests(root)
	if packageError != nil {
		return AuditReport{}, packageError
	}

	languages, languageError := CountLanguages(root)
	if languageError != nil {
		return AuditReport{}, languageError
	}

	return AuditReport{
		Root:      root,
		Packages:  packages,
		Languages: languages,
	}, nil
}

func FindPackageManifests(root string) ([]PackageManifest, error) {
	var manifests []PackageManifest

	walkError := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}

		if entry.IsDir() {
			if ignoredDirectoryNames[entry.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		if entry.Name() != "package.json" {
			return nil
		}

		manifest, readError := readPackageManifest(root, path)
		if readError != nil {
			return readError
		}
		if manifest.Name != "" {
			manifests = append(manifests, manifest)
		}
		return nil
	})
	if walkError != nil {
		return nil, walkError
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

	walkError := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}

		if entry.IsDir() {
			if ignoredDirectoryNames[entry.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		language := languageByExtensionMap[strings.ToLower(filepath.Ext(entry.Name()))]
		if language == "" {
			return nil
		}

		fileInfo, fileInfoError := entry.Info()
		if fileInfoError != nil {
			return fileInfoError
		}

		current := stats[language]
		current.files++
		current.bytes += fileInfo.Size()
		stats[language] = current
		totalBytes += fileInfo.Size()
		return nil
	})
	if walkError != nil {
		return nil, walkError
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

	content, readError := os.ReadFile(path)
	if readError != nil {
		return PackageManifest{}, readError
	}

	var manifest rawManifest
	if unmarshalError := json.Unmarshal(content, &manifest); unmarshalError != nil {
		return PackageManifest{}, unmarshalError
	}

	relativePath, pathError := filepath.Rel(root, path)
	if pathError != nil {
		relativePath = path
	}

	return PackageManifest{
		Name:    manifest.Name,
		Version: manifest.Version,
		Path:    filepath.ToSlash(relativePath),
	}, nil
}
