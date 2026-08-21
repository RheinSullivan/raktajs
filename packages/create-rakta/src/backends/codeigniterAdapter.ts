import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const codeigniterCapabilities: BackendCapabilities = {
	framework: "codeigniter",
	language: "PHP",
	runtime: "PHP 8.1+",
	defaultDatabase: "mysql",
	supportedDatabases: ["mysql", "postgresql", "sqlite", "sawitdb"],
	authentication: "CodeIgniter Shield / Custom Filter",
	middleware: "CodeIgniter 4 Filters",
	validation: "CodeIgniter Validation Service",
	apiType: "REST / MVC",
	developmentCommand: "php spark serve --port 4000",
	productionCommand: "php spark serve --env production",
	databaseDriver: "CodeIgniter Model / SawitDB-PHP Library",
	sawitDatabaseSupport: true,
	generationStatus: "IMPLEMENTED",
};

export const codeigniterAdapter: BackendAdapter = {
	identifier: "codeigniter",
	name: "CodeIgniter 4",
	language: "PHP",
	runtime: "PHP",
	capabilities: codeigniterCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const isSawitDatabase = projectConfiguration.database === "sawitdb";

		const composerContent = JSON.stringify(
			{
				name: `rakta/${projectName}-backend`,
				type: "project",
				description: "CodeIgniter 4 backend for Rakta.js fullstack ecosystem",
				require: {
					php: "^8.1",
					"codeigniter4/framework": "^4.4",
					...(isSawitDatabase ? { "wowoengine/sawitdb-php": "^1.0" } : {}),
				},
				autoload: {
					"psr-4": {
						"App\\\\": "app/"
					}
				}
			},
			null,
			2,
		);

		const routesContent = `<?php

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('health', 'HealthController::index');
$routes->get('api/users', 'UserController::index');
$routes->post('api/auth/login', 'AuthController::login');
`;

		const sparkContent = `#!/usr/bin/env php
<?php

define('SPARK_START', microtime(true));

echo "CodeIgniter 4 Spark CLI for Rakta.js\n";
echo "Run 'php spark serve --port 4000' to launch the development server.\n";
`;

		const authControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\HTTP\\ResponseInterface;

class AuthController extends BaseController
{
    public function login(): ResponseInterface
    {
        $json = $this->request->getJSON(true);
        return $this->response->setJSON([
            'status' => 'success',
            'user' => ['id' => 1, 'email' => $json['email'] ?? 'admin@example.com'],
            'token' => 'ci4_auth_token_mock',
        ]);
    }
}
`;

		const userControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\HTTP\\ResponseInterface;

class UserController extends BaseController
{
    public function index(): ResponseInterface
    {
        return $this->response->setJSON([
            ['id' => 1, 'name' => 'Rhein Sullivan', 'role' => 'admin'],
            ['id' => 2, 'name' => 'CodeIgniter Developer', 'role' => 'user'],
        ]);
    }
}
`;

		const healthControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\HTTP\\ResponseInterface;

class HealthController extends BaseController
{
    public function index(): ResponseInterface
    {
        return $this->response->setJSON([
            'status' => 'ok',
            'framework' => 'CodeIgniter 4',
            'timestamp' => date('c'),
        ]);
    }
}
`;

		const baseControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\Controller;
use CodeIgniter\\HTTP\\RequestInterface;
use CodeIgniter\\HTTP\\ResponseInterface;
use Psr\\Log\\LoggerInterface;

abstract class BaseController extends Controller
{
    protected $request;
    protected $helpers = [];

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);
    }
}
`;

		return [
			{ path: "backend/composer.json", content: composerContent },
			{ path: "backend/spark", content: sparkContent },
			{ path: "backend/app/Config/Routes.php", content: routesContent },
			{ path: "backend/app/Controllers/BaseController.php", content: baseControllerContent },
			{ path: "backend/app/Controllers/HealthController.php", content: healthControllerContent },
			{ path: "backend/app/Controllers/AuthController.php", content: authControllerContent },
			{ path: "backend/app/Controllers/UserController.php", content: userControllerContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (CodeIgniter 4)\n\nCodeIgniter 4 MVC backend.\n\n## Commands\n- Dev: \`php spark serve --port 4000\`\n`,
			},
		];
	},
};
