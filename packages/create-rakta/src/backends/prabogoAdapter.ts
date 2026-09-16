import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const oauthExtraImports = hasOAuthEnabled
			? '\t"net/url"\n\t"os"\n\t"strings"\n'
			: "";

		const oauthGoRoutes = hasOAuthEnabled
			? `
	http.HandleFunc("/api/auth/oauth/{provider}/login", oauthLoginHandler)
	http.HandleFunc("/api/auth/oauth/{provider}/callback", oauthCallbackHandler)
`
			: "";

		const oauthGoHandlers = hasOAuthEnabled
			? `
var oauthEndpoints = map[string]string{
	"google":    "https://accounts.google.com/o/oauth2/v2/auth",
	"github":    "https://github.com/login/oauth/authorize",
	"apple":     "https://appleid.apple.com/auth/authorize",
	"microsoft": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
	"discord":   "https://discord.com/oauth2/authorize",
	"gitlab":    "https://gitlab.com/oauth/authorize",
	"facebook":  "https://www.facebook.com/v19.0/dialog/oauth",
}

var oauthScopes = map[string]string{
	"google":    "openid profile email",
	"github":    "read:user user:email",
	"apple":     "name email",
	"microsoft": "user.read openid profile email",
	"discord":   "identify email",
	"gitlab":    "read_user",
	"facebook":  "email public_profile",
}

func oauthRedirectURI(request *http.Request) string {
	provider := request.PathValue("provider")
	if custom := os.Getenv(strings.ToUpper(provider) + "_REDIRECT_URI"); custom != "" {
		return custom
	}
	base := os.Getenv("OAUTH_REDIRECT_BASE_URL")
	if base == "" {
		base = "http://localhost:4000"
	}
	return base + "/api/auth/oauth/" + provider + "/callback"
}

func oauthLoginHandler(writer http.ResponseWriter, request *http.Request) {
	provider := request.PathValue("provider")
	clientID := os.Getenv(strings.ToUpper(provider) + "_CLIENT_ID")
	redirectURI := oauthRedirectURI(request)
	authorizeEndpoint := oauthEndpoints[provider]
	if authorizeEndpoint == "" {
		authorizeEndpoint = oauthEndpoints["google"]
	}
	scope := oauthScopes[provider]
	if scope == "" {
		scope = "openid profile email"
	}
	query := url.Values{}
	query.Set("client_id", clientID)
	query.Set("redirect_uri", redirectURI)
	query.Set("response_type", "code")
	query.Set("scope", scope)
	http.Redirect(writer, request, authorizeEndpoint+"?"+query.Encode(), http.StatusFound)
}

func oauthCallbackHandler(writer http.ResponseWriter, request *http.Request) {
	provider := request.PathValue("provider")
	code := request.URL.Query().Get("code")
	http.Redirect(writer, request, "http://localhost:3000/auth/sign-in?oauth="+provider+"&code="+url.QueryEscape(code), http.StatusFound)
}
`
			: "";

		const goModContent = `module ${projectName}-backend

go 1.22
`;

		const mainContent = `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
${oauthExtraImports})
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

	http.HandleFunc("/api/cms/posts", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		if request.Method == http.MethodPost {
			var body map[string]interface{}
			if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
				body = map[string]interface{}{}
			}
			title, _ := body["title"].(string)
			if title == "" {
				title = "Untitled"
			}
			writer.WriteHeader(http.StatusCreated)
			json.NewEncoder(writer).Encode(map[string]interface{}{
				"id":        fmt.Sprintf("post_%d", time.Now().UnixMilli()),
				"title":     title,
				"published": true,
			})
			return
		}
		json.NewEncoder(writer).Encode([]map[string]interface{}{
			{"id": "post_1", "title": "Welcome to Rakta.js + Prabogo", "published": true},
		})
	})
${oauthGoRoutes}
	fmt.Println("Prabogo server listening on http://localhost:4000")
	http.ListenAndServe(":4000", nil)
}
${oauthGoHandlers}`;

		return [
			{ path: "backend/go.mod", content: goModContent },
			{ path: "backend/main.go", content: mainContent },
			...(hasOAuthEnabled
				? [
						{
							path: "backend/.env.example",
							content: buildOAuthEnvLines(
								oauthProviders,
								"http://localhost:4000",
							),
						},
					]
				: []),
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Prabogo)\n\nGolang hexagonal architecture framework backend.\n\n## Commands\n- Dev: \`go run main.go\`\n`,
			},
		];
	},
};
