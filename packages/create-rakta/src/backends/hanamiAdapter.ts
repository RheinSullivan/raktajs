import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const hanamiCapabilities: BackendCapabilities = {
	framework: "hanami",
	language: "Ruby",
	runtime: "Ruby 3.3+",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite"],
	authentication: "Hanami Action Authentication / Warden",
	middleware: "Hanami Router / Rack Middleware",
	validation: "dry-validation / dry-schema",
	apiType: "REST / Slice Architecture",
	developmentCommand: "bundle exec hanami server -p 4000",
	productionCommand: "bundle exec hanami server -e production",
	databaseDriver: "ROM-rb (Ruby Object Mapper)",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const hanamiAdapter: BackendAdapter = {
	identifier: "hanami",
	name: "Hanami 2.x",
	language: "Ruby",
	runtime: "Ruby",
	capabilities: hanamiCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);
		const moduleName = projectName.replace(/[^a-zA-Z0-9]/g, "");

		const gemfileContent = `source "https://rubygems.org"
ruby ">= 3.2.0"

gem "hanami", "~> 2.1.0"
gem "hanami-router", "~> 2.1.0"
gem "hanami-controller", "~> 2.1.0"
gem "puma", "~> 6.0"
`;

		const appConfigContent = `module ${projectName.replace(/[^a-zA-Z0-9]/g, "")}
  class App < Hanami::App
    config.middleware.use Rack::Cors do
      allow do
        origins "*"
        resource "*", headers: :any, methods: [:get, :post, :put, :delete, :options]
      end
    end
  end
end
`;

		const oauthRoutesPart = hasOAuthEnabled
			? `
    get "/api/auth/oauth/:provider/login", to: "oauth.login"
    get "/api/auth/oauth/:provider/callback", to: "oauth.callback"
`
			: "";

		const routesContent = `module ${moduleName}
  class Routes < Hanami::Routes
    get "/health", to: "health.show"
    get "/api/users", to: "users.index"
    get "/api/cms/posts", to: "cms.index"
    post "/api/cms/posts", to: "cms.create"
${oauthRoutesPart}}`;

		const oauthLoginActionContent = `module ${moduleName}
  module Actions
    module Oauth
      class Login < Hanami::Action
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

        def handle(request, response)
          provider = request.params[:provider]
          upper_provider = provider.upcase
          client_id = ENV.fetch("#{upper_provider}_CLIENT_ID", "")
          redirect_uri = ENV.fetch("#{upper_provider}_REDIRECT_URI", "#{ENV.fetch("OAUTH_REDIRECT_BASE_URL", "http://localhost:4000")}/api/auth/oauth/#{provider}/callback")
          authorize_endpoint = ENDPOINTS.fetch(provider, "")
          scope = SCOPES.fetch(provider, "openid profile email")
          authorize_url = "#{authorize_endpoint}?client_id=#{CGI.escape(client_id)}&redirect_uri=#{CGI.escape(redirect_uri)}&response_type=code&scope=#{CGI.escape(scope)}"

          response.redirect_to authorize_url
        end
      end
    end
  end
end
`;

		const healthActionContent = `module ${projectName.replace(/[^a-zA-Z0-9]/g, "")}
  module Actions
    module Health
      class Show < Hanami::Action
        def handle(*, response)
          response.format = :json
          response.body = { status: "ok", framework: "Hanami 2.x", language: "Ruby" }.to_json
        end
      end
    end
  end
end
`;

		const usersActionContent = `module ${projectName.replace(/[^a-zA-Z0-9]/g, "")}
  module Actions
    module Users
      class Index < Hanami::Action
        def handle(*, response)
          response.format = :json
          response.body = [
            { id: "usr_1", name: "Rhein Sullivan" },
            { id: "usr_2", name: "Hanami Developer" }
          ].to_json
        end
      end
    end
  end
end
`;

		const cmsActionContent = `module ${projectName.replace(/[^a-zA-Z0-9]/g, "")}
  module Actions
    module Cms
      class Index < Hanami::Action
        def handle(*, response)
          response.format = :json
          response.body = [
            { id: "post_1", title: "Welcome to Rakta.js + Hanami 2.x", published: true }
          ].to_json
        end
      end

      class Create < Hanami::Action
        def handle(request, response)
          response.format = :json
          response.body = {
            id: "post_#{Time.now.to_i}",
            title: request.params[:title].to_s.empty? ? "Untitled" : request.params[:title],
            published: true
          }.to_json
          response.status = 201
        end
      end
    end
  end
end
`;

		const oauthCallbackActionContent = hasOAuthEnabled
			? `module ${moduleName}
  module Actions
    module Oauth
      class Callback < Hanami::Action
        def handle(request, response)
          provider = request.params[:provider]
          code = request.params[:code].to_s
          response.redirect_to "http://localhost:3000/auth/sign-in?oauth=#{provider}&code=#{CGI.escape(code)}"
        end
      end
    end
  end
end
`
			: "";

		return [
			{ path: "backend/Gemfile", content: gemfileContent },
			{ path: "backend/config/app.rb", content: appConfigContent },
			{ path: "backend/config/routes.rb", content: routesContent },
			{
				path: "backend/app/actions/health/show.rb",
				content: healthActionContent,
			},
			{
				path: "backend/app/actions/users/index.rb",
				content: usersActionContent,
			},
			{
				path: "backend/app/actions/cms/index.rb",
				content: cmsActionContent,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/app/actions/oauth/login.rb",
							content: oauthLoginActionContent,
						},
						{
							path: "backend/app/actions/oauth/callback.rb",
							content: oauthCallbackActionContent,
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
				content: `# ${projectName} Backend (Hanami 2.x)\n\nModern Hanami 2.x Ruby framework.\n\n## Commands\n- Install: \`bundle install\`\n- Dev: \`bundle exec hanami server -p 4000\`\n`,
			},
		];
	},
};
