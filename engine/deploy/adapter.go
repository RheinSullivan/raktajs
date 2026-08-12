package deploy

import (
	"fmt"
	"os"
	"path/filepath"
)

type Target string

const (
	TargetVercel     Target = "vercel"
	TargetNetlify    Target = "netlify"
	TargetCloudflare Target = "cloudflare"
	TargetRailway    Target = "railway"
	TargetDocker     Target = "docker"
)

type DeploymentSpec struct {
	Target   Target
	AppName  string
	OutputDir string
}

func GenerateAdapter(spec DeploymentSpec) error {
	if spec.OutputDir == "" {
		spec.OutputDir = "."
	}

	switch spec.Target {
	case TargetVercel:
		return generateVercelSpec(spec)
	case TargetNetlify:
		return generateNetlifySpec(spec)
	case TargetCloudflare:
		return generateCloudflareSpec(spec)
	case TargetRailway:
		return generateRailwaySpec(spec)
	case TargetDocker:
		return generateDockerSpec(spec)
	default:
		return fmt.Errorf("unsupported deployment target: %s", spec.Target)
	}
}

func generateVercelSpec(spec DeploymentSpec) error {
	config := `{
  "version": 2,
  "framework": null,
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}`
	return os.WriteFile(filepath.Join(spec.OutputDir, "vercel.json"), []byte(config), 0644)
}

func generateNetlifySpec(spec DeploymentSpec) error {
	config := `[build]
  command = "bun run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
	return os.WriteFile(filepath.Join(spec.OutputDir, "netlify.toml"), []byte(config), 0644)
}

func generateCloudflareSpec(spec DeploymentSpec) error {
	config := fmt.Sprintf(`name = "%s"
compatibility_date = "2026-08-01"
pages_build_output_dir = "./dist"
`, spec.AppName)
	return os.WriteFile(filepath.Join(spec.OutputDir, "wrangler.toml"), []byte(config), 0644)
}

func generateRailwaySpec(spec DeploymentSpec) error {
	config := `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bun run start"
  }
}`
	return os.WriteFile(filepath.Join(spec.OutputDir, "railway.json"), []byte(config), 0644)
}

func generateDockerSpec(spec DeploymentSpec) error {
	dockerfile := `FROM oven/bun:latest AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
`
	return os.WriteFile(filepath.Join(spec.OutputDir, "Dockerfile"), []byte(dockerfile), 0644)
}
