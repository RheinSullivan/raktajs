import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

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

		const routesContent = `module ${projectName.replace(/[^a-zA-Z0-9]/g, "")}
  class Routes < Hanami::Routes
    get "/health", to: "health.show"
    get "/api/users", to: "users.index"
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
				path: "backend/README.md",
				content: `# ${projectName} Backend (Hanami 2.x)\n\nModern Hanami 2.x Ruby framework.\n\n## Commands\n- Install: \`bundle install\`\n- Dev: \`bundle exec hanami server -p 4000\`\n`,
			},
		];
	},
};
