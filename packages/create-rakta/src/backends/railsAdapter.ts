import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const gemfileContent = `source "https://rubygems.org"
ruby ">= 3.2.0"

gem "rails", "~> 7.1.0"
gem "puma", "~> 6.0"
gem "pg", "~> 1.5"
gem "rack-cors"
gem "bootsnap", require: false
`;

		const oauthRoutesPart = hasOAuthEnabled
			? `
  get "/api/auth/oauth/:provider/login", to: "oauth#login"
  get "/api/auth/oauth/:provider/callback", to: "oauth#callback"
`
			: "";

		const routesContent = `Rails.application.routes.draw do
  get "/health", to: "health#show"
  get "/api/users", to: "users#index"
  post "/api/auth/login", to: "auth#create"
  get "/api/cms/posts", to: "cms#index"
  post "/api/cms/posts", to: "cms#create"
${oauthRoutesPart}}`;

		const oauthControllerContent = `class OAuthController < ApplicationController
  ENDPOINTS = {
    "google" => "https://accounts.google.com/o/oauth2/v2/auth",
    "github" => "https://github.com/login/oauth/authorize",
    "apple" => "https://appleid.apple.com/auth/authorize",
    "microsoft" => "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "discord" => "https://discord.com/oauth2/authorize",
    "gitlab" => "https://gitlab.com/oauth/authorize",
    "facebook" => "https://www.facebook.com/v19.0/dialog/oauth"
  }.freeze

  SCOPES = {
    "google" => "openid profile email",
    "github" => "read:user user:email",
    "apple" => "name email",
    "microsoft" => "user.read openid profile email",
    "discord" => "identify email",
    "gitlab" => "read_user",
    "facebook" => "email public_profile"
  }.freeze

  def login
    provider = params[:provider]
    upper_provider = provider.upcase
    client_id = ENV.fetch("#{upper_provider}_CLIENT_ID", "")
    redirect_uri = ENV.fetch("#{upper_provider}_REDIRECT_URI", "#{ENV.fetch("OAUTH_REDIRECT_BASE_URL", "http://localhost:4000")}/api/auth/oauth/#{provider}/callback")
    authorize_endpoint = ENDPOINTS.fetch(provider, "")
    scope = SCOPES.fetch(provider, "openid profile email")
    authorize_url = "#{authorize_endpoint}?client_id=#{CGI.escape(client_id)}&redirect_uri=#{CGI.escape(redirect_uri)}&response_type=code&scope=#{CGI.escape(scope)}"

    redirect_to authorize_url, allow_other_host: true, status: :found
  end

  def callback
    provider = params[:provider]
    code = params[:code].to_s
    redirect_to "http://localhost:3000/auth/sign-in?oauth=#{provider}&code=#{CGI.escape(code)}", allow_other_host: true, status: :found
  end
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

		const cmsControllerContent = `class CmsController < ApplicationController
  def index
    render json: [
      { id: "post_1", title: "Welcome to Rakta.js + Ruby on Rails", published: true }
    ]
  end

  def create
    render json: {
      id: "post_#{Time.now.to_i}",
      title: params[:title].presence || "Untitled",
      published: true
    }, status: :created
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
				path: "backend/app/controllers/cms_controller.rb",
				content: cmsControllerContent,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/app/controllers/oauth_controller.rb",
							content: oauthControllerContent,
						},
					]
				: []),
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
				content: `# ${projectName} Backend (Ruby on Rails)\n\nFull-stack convention-driven Ruby framework.\n\n## Commands\n- Install: \`bundle install\`\n- Dev: \`bin/rails server -p 4000\`\n`,
			},
		];
	},
};
