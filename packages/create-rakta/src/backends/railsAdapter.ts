import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const railsCapabilities: BackendCapabilities = {
	framework: "rails",
	language: "Ruby",
	runtime: "Ruby 3.3+",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite"],
	authentication: "Devise / Rodauth / Warden",
	middleware: "Rack Middleware Stack",
	validation: "ActiveModel Validations",
	apiType: "REST / Active Admin",
	developmentCommand: "bin/rails server -p 4000",
	productionCommand: "bin/rails server -e production",
	databaseDriver: "ActiveRecord ORM",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const railsAdapter: BackendAdapter = {
	identifier: "rails",
	name: "Ruby on Rails",
	language: "Ruby",
	runtime: "Ruby",
	capabilities: railsCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const gemfileContent = `source "https://rubygems.org"
ruby ">= 3.2.0"

gem "rails", "~> 7.1.0"
gem "puma", "~> 6.0"
gem "pg", "~> 1.5"
gem "rack-cors"
gem "bootsnap", require: false
`;

		const routesContent = `Rails.application.routes.draw do
  get "/health", to: "health#show"
  get "/api/users", to: "users#index"
  post "/api/auth/login", to: "auth#create"
end
`;

		const applicationControllerContent = `class ApplicationController < ActionController::API
end
`;

		const healthControllerContent = `class HealthController < ApplicationController
  def show
    render json: { status: "ok", framework: "Ruby on Rails", language: "Ruby" }
  end
end
`;

		const usersControllerContent = `class UsersController < ApplicationController
  def index
    render json: [
      { id: "usr_1", name: "Rhein Sullivan" },
      { id: "usr_2", name: "Rails Developer" }
    ]
  end
end
`;

		return [
			{ path: "backend/Gemfile", content: gemfileContent },
			{ path: "backend/config/routes.rb", content: routesContent },
			{
				path: "backend/app/controllers/application_controller.rb",
				content: applicationControllerContent,
			},
			{
				path: "backend/app/controllers/health_controller.rb",
				content: healthControllerContent,
			},
			{
				path: "backend/app/controllers/users_controller.rb",
				content: usersControllerContent,
			},
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Ruby on Rails)\n\nFull-stack convention-driven Ruby framework.\n\n## Commands\n- Install: \`bundle install\`\n- Dev: \`bin/rails server -p 4000\`\n`,
			},
		];
	},
};
