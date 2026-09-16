import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const beegoCapabilities: BackendCapabilities = {
	framework: "beego",
	language: "Go",
	runtime: "Go 1.22+",
	defaultDatabase: "mysql",
	supportedDatabases: ["mysql", "postgresql", "sqlite"],
	authentication: "Beego Session / JWT Filter",
	middleware: "Beego Filter Chains",
	validation: "Beego Validation",
	apiType: "REST / MVC",
	developmentCommand: "bee run",
	productionCommand: "go build -o server && ./server",
	databaseDriver: "Beego ORM",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const beegoAdapter: BackendAdapter = {
	identifier: "beego",
	name: "Beego v2",
	language: "Go",
	runtime: "Go",
	capabilities: beegoCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const goModContent = `module ${projectName}-backend

go 1.22

require (
	github.com/beego/beego/v2 v2.1.0
)
`;

		const appConfContent = `appname = ${projectName}-backend
httpport = 4000
runmode = dev
autorender = false
copyrequestbody = true
EnableDocs = true
`;

		const mainContent = `package main

import (
	_ "${projectName}-backend/routers"
	beego "github.com/beego/beego/v2/server/web"
)

func main() {
	beego.Run(":4000")
}
`;

		const oauthRouterLines = hasOAuthEnabled
			? `	beego.Router("/api/auth/oauth/:provider/login", &controllers.OAuthController{}, "get:Login")
	beego.Router("/api/auth/oauth/:provider/callback", &controllers.OAuthController{}, "get:Callback")

`
			: "";

		const routerContent = `package routers

import (
	"${projectName}-backend/controllers"
	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	beego.Router("/health", &controllers.MainController{}, "get:GetHealth")
	beego.Router("/api/users", &controllers.UserController{}, "get:GetUsers")
	beego.Router("/api/cms/posts", &controllers.CmsController{}, "get:GetPosts,post:CreatePost")
${oauthRouterLines}}`;

		const oauthControllerContent = `package controllers

import (
	"net/url"
	"os"
	"strings"

	beego "github.com/beego/beego/v2/server/web"
)

type OAuthController struct {
	beego.Controller
}

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

func (controller *OAuthController) Login() {
	provider := controller.Ctx.Input.Param(":provider")
	clientID := os.Getenv(strings.ToUpper(strings.ToLower(provider)) + "_CLIENT_ID")
	redirectURI := os.Getenv(strings.ToUpper(strings.ToLower(provider)) + "_REDIRECT_URI")
	if redirectURI == "" {
		base := os.Getenv("OAUTH_REDIRECT_BASE_URL")
		if base == "" {
			base = "http://localhost:4000"
		}
		redirectURI = base + "/api/auth/oauth/" + provider + "/callback"
	}
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
	controller.Redirect(authorizeEndpoint+"?"+query.Encode(), 302)
}

func (controller *OAuthController) Callback() {
	provider := controller.Ctx.Input.Param(":provider")
	code := controller.GetString("code")
	authorizeURL := "http://localhost:3000/auth/sign-in?oauth=" + provider + "&code=" + url.QueryEscape(code)
	controller.Redirect(authorizeURL, 302)
}
`;

		const mainControllerContent = `package controllers

import (
	beego "github.com/beego/beego/v2/server/web"
)

type MainController struct {
	beego.Controller
}

func (controller *MainController) GetHealth() {
	controller.Data["json"] = map[string]string{
		"status":    "ok",
		"framework": "Beego v2",
		"language":  "Go",
	}
	controller.ServeJSON()
}
`;

		const userControllerContent = `package controllers

import (
	beego "github.com/beego/beego/v2/server/web"
)

type UserController struct {
	beego.Controller
}

func (controller *UserController) GetUsers() {
	users := []map[string]string{
		{"id": "usr_1", "name": "Rhein Sullivan"},
		{"id": "usr_2", "name": "Beego Developer"},
	}
	controller.Data["json"] = users
	controller.ServeJSON()
}
`;

		const cmsControllerContent = `package controllers

import (
	"time"

	beego "github.com/beego/beego/v2/server/web"
)

type CmsController struct {
	beego.Controller
}

func (controller *CmsController) GetPosts() {
	posts := []map[string]interface{}{
		{"id": "post_1", "title": "Welcome to Rakta.js + Beego v2", "published": true},
	}
	controller.Data["json"] = posts
	controller.ServeJSON()
}

func (controller *CmsController) CreatePost() {
	body := map[string]interface{}{}
	if err := controller.ParseForm(&body); err != nil {
		body = map[string]interface{}{}
	}
	title, _ := body["title"].(string)
	if title == "" {
		title = "Untitled"
	}
	controller.Data["json"] = map[string]interface{}{
		"id":        "post_" + time.Now().Format("20060102150405"),
		"title":     title,
		"published": true,
	}
	controller.ServeJSON()
}
`;

		return [
			{ path: "backend/go.mod", content: goModContent },
			{ path: "backend/conf/app.conf", content: appConfContent },
			{ path: "backend/main.go", content: mainContent },
			{ path: "backend/routers/router.go", content: routerContent },
			{ path: "backend/controllers/main.go", content: mainControllerContent },
			{ path: "backend/controllers/user.go", content: userControllerContent },
			{ path: "backend/controllers/cms.go", content: cmsControllerContent },
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
			...(hasOAuthEnabled
				? [
						{
							path: "backend/controllers/oauth.go",
							content: oauthControllerContent,
						},
					]
				: []),
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Beego v2)\n\nBeego v2 REST / MVC enterprise Go framework.\n\n## Commands\n- Dev: \`bee run\` or \`go run main.go\`\n`,
			},
		];
	},
};
