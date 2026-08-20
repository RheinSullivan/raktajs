import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const prabogoCapabilities: BackendCapabilities = {
	framework: "prabogo",
	language: "Go",
	runtime: "Go 1.22+",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite"],
	authentication: "Prabogo Auth Guard / JWT",
	middleware: "Prabogo Hexagonal Middleware Stack",
	validation: "Go Playground Validator",
	apiType: "REST / gRPC",
	developmentCommand: "go run main.go",
	productionCommand: "go build -o server && ./server",
	databaseDriver: "GORM / pgx",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const prabogoAdapter: BackendAdapter = {
	identifier: "prabogo",
	name: "Prabogo",
	language: "Go",
	runtime: "Go",
	capabilities: prabogoCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const goModContent = `module ${projectName}-backend

go 1.22
`;

		const mainContent = `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	ID   string \`json:"id"\`
	Name string \`json:"name"\`
}

func main() {
	http.HandleFunc("/health", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(map[string]string{
			"status":    "ok",
			"framework": "Prabogo Hexagonal Engine",
			"language":  "Go",
		})
	})

	http.HandleFunc("/api/users", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		users := []User{
			{ID: "usr_1", Name: "Rhein Sullivan"},
			{ID: "usr_2", Name: "Prabogo Developer"},
		}
		json.NewEncoder(writer).Encode(users)
	})

	fmt.Println("Prabogo server listening on http://localhost:4000")
	http.ListenAndServe(":4000", nil)
}
`;

		return [
			{ path: "backend/go.mod", content: goModContent },
			{ path: "backend/main.go", content: mainContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Prabogo)\n\nGolang hexagonal architecture framework backend.\n\n## Commands\n- Dev: \`go run main.go\`\n`,
			},
		];
	},
};
