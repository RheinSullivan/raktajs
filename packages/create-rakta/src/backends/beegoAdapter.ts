import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

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
	name: "Beego",
	language: "Go",
	runtime: "Go",
	capabilities: beegoCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

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

		const routerContent = `package routers

import (
	"${projectName}-backend/controllers"
	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	beego.Router("/health", &controllers.MainController{}, "get:GetHealth")
	beego.Router("/api/users", &controllers.UserController{}, "get:GetUsers")
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

		return [
			{ path: "backend/go.mod", content: goModContent },
			{ path: "backend/conf/app.conf", content: appConfContent },
			{ path: "backend/main.go", content: mainContent },
			{ path: "backend/routers/router.go", content: routerContent },
			{ path: "backend/controllers/main.go", content: mainControllerContent },
			{ path: "backend/controllers/user.go", content: userControllerContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Beego v2)\n\nBeego v2 REST / MVC enterprise Go framework.\n\n## Commands\n- Dev: \`bee run\` or \`go run main.go\`\n`,
			},
		];
	},
};
