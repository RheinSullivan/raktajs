import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

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
						"App\\\\": "app/",
					},
				},
			},
			null,
			2,
		);

		const oauthRoutesPart = hasOAuthEnabled
			? `
$routes->get('api/auth/oauth/(:segment)/login', 'OAuthController::redirect/$1');
$routes->get('api/auth/oauth/(:segment)/callback', 'OAuthController::callback/$1');
`
			: "";

		const routesContent = `<?php

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('health', 'HealthController::index');
$routes->get('api/users', 'UserController::index');
$routes->post('api/auth/login', 'AuthController::login');
$routes->get('api/cms/posts', 'CmsController::index');
$routes->post('api/cms/posts', 'CmsController::store');
${oauthRoutesPart}`;

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

		const cmsControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\HTTP\\ResponseInterface;

class CmsController extends BaseController
{
    public function index(): ResponseInterface
    {
        return $this->response->setJSON([
            ['id' => 1, 'title' => 'Welcome to Rakta.js + CodeIgniter 4', 'published' => true],
        ]);
    }

    public function store(): ResponseInterface
    {
        $json = $this->request->getJSON(true);
        return $this->response->setStatusCode(201)->setJSON([
            'id' => time(),
            'title' => $json['title'] ?? 'Untitled',
            'published' => true,
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

		const oauthControllerContent = `<?php

namespace App\\Controllers;

use CodeIgniter\\HTTP\\ResponseInterface;

class OAuthController extends BaseController
{
    public function redirect(string $provider): ResponseInterface
    {
        $upperProvider = strtoupper($provider);
        $clientId = env($upperProvider . '_CLIENT_ID', '');
        $redirectUri = env($upperProvider . '_REDIRECT_URI', 'http://localhost:4000/api/auth/oauth/' . $provider . '/callback');

        $endpoints = [
            'google' => 'https://accounts.google.com/o/oauth2/v2/auth',
            'github' => 'https://github.com/login/oauth/authorize',
            'apple' => 'https://appleid.apple.com/auth/authorize',
            'microsoft' => 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            'discord' => 'https://discord.com/oauth2/authorize',
            'gitlab' => 'https://gitlab.com/oauth/authorize',
            'facebook' => 'https://www.facebook.com/v19.0/dialog/oauth',
        ];

        $scopes = [
            'google' => 'openid profile email',
            'github' => 'read:user user:email',
            'apple' => 'name email',
            'microsoft' => 'user.read openid profile email',
            'discord' => 'identify email',
            'gitlab' => 'read_user',
            'facebook' => 'email public_profile',
        ];

        $authorizeEndpoint = $endpoints[$provider] ?? '';
        $scope = $scopes[$provider] ?? 'openid profile email';
        $authorizeUrl = $authorizeEndpoint
            . '?client_id=' . rawurlencode($clientId)
            . '&redirect_uri=' . rawurlencode($redirectUri)
            . '&response_type=code'
            . '&scope=' . rawurlencode($scope);

        return $this->response->redirect($authorizeUrl);
    }

    public function callback(string $provider): ResponseInterface
    {
        $code = $this->request->getGet('code') ?? '';
        // Real flow: exchange $code for tokens, link or create the user, then
        // return an auth token. The stub redirects back to the frontend.
        return $this->response->redirect('http://localhost:3000/auth/sign-in?oauth=' . $provider . '&code=' . rawurlencode($code));
    }
}
`;

		return [
			{ path: "backend/composer.json", content: composerContent },
			{ path: "backend/spark", content: sparkContent },
			{ path: "backend/app/Config/Routes.php", content: routesContent },
			{
				path: "backend/app/Controllers/BaseController.php",
				content: baseControllerContent,
			},
			{
				path: "backend/app/Controllers/HealthController.php",
				content: healthControllerContent,
			},
			{
				path: "backend/app/Controllers/AuthController.php",
				content: authControllerContent,
			},
			{
				path: "backend/app/Controllers/UserController.php",
				content: userControllerContent,
			},
			{
				path: "backend/app/Controllers/CmsController.php",
				content: cmsControllerContent,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/app/Controllers/OAuthController.php",
							content: oauthControllerContent,
						},
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
				content: `# ${projectName} Backend (CodeIgniter 4)\n\nCodeIgniter 4 MVC backend.\n\n## Commands\n- Dev: \`php spark serve --port 4000\`\n`,
			},
		];
	},
};
