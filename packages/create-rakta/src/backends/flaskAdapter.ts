import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const flaskCapabilities: BackendCapabilities = {
	framework: "flask",
	language: "Python",
	runtime: "Python 3.10+",
	defaultDatabase: "sqlite",
	supportedDatabases: ["sqlite", "postgresql", "mysql"],
	authentication: "Flask-JWT-Extended / Flask-Login",
	middleware: "Flask Request Hooks (before_request / after_request)",
	validation: "Marshmallow / Pydantic",
	apiType: "REST",
	developmentCommand: "flask run --port=4000",
	productionCommand: "gunicorn app:app",
	databaseDriver: "Flask-SQLAlchemy",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const flaskAdapter: BackendAdapter = {
	identifier: "flask",
	name: "Flask",
	language: "Python",
	runtime: "Python",
	capabilities: flaskCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const requirementsContent = `flask>=3.0.0
flask-cors>=4.0.0
pyjwt>=2.8.0
python-dotenv>=1.0.0
`;

		const oauthFlaskPart = hasOAuthEnabled
			? `
OAUTH_ENDPOINTS = {
    "google": "https://accounts.google.com/o/oauth2/v2/auth",
    "github": "https://github.com/login/oauth/authorize",
    "apple": "https://appleid.apple.com/auth/authorize",
    "microsoft": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "discord": "https://discord.com/oauth2/authorize",
    "gitlab": "https://gitlab.com/oauth/authorize",
    "facebook": "https://www.facebook.com/v19.0/dialog/oauth",
}

OAUTH_SCOPES = {
    "google": "openid profile email",
    "github": "read:user user:email",
    "apple": "name email",
    "microsoft": "user.read openid profile email",
    "discord": "identify email",
    "gitlab": "read_user",
    "facebook": "email public_profile",
}

@app.route("/api/auth/oauth/<provider>/login", methods=["GET"])
def oauth_login(provider):
    from urllib.parse import urlencode
    upper_provider = provider.upper()
    client_id = os.environ.get(f"{upper_provider}_CLIENT_ID", "")
    redirect_uri = os.environ.get(
        f"{upper_provider}_REDIRECT_URI",
        f"{os.environ.get('OAUTH_REDIRECT_BASE_URL', 'http://localhost:4000')}/api/auth/oauth/{provider}/callback",
    )
    authorize_endpoint = OAUTH_ENDPOINTS.get(provider, "")
    scope = OAUTH_SCOPES.get(provider, "openid profile email")
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
    })
    return redirect(f"{authorize_endpoint}?{query}")

@app.route("/api/auth/oauth/<provider>/callback", methods=["GET"])
def oauth_callback(provider):
    code = request.args.get("code", "")
    # Exchange the code for tokens in a real implementation, then
    # redirect back to the frontend sign-in page.
    return redirect(f"http://localhost:3000/auth/sign-in?oauth={provider}&code={quote(code)}")
`
			: "";

		const oauthFlaskImports = hasOAuthEnabled
			? "from flask import Flask, jsonify, request, redirect\nfrom urllib.parse import quote\n"
			: "from flask import Flask, jsonify, request\n";

		const appPyContent = `${oauthFlaskImports}from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "framework": "Flask",
        "language": "Python"
    })

@app.route("/api/users", methods=["GET"])
def get_users():
    return jsonify([
        {"id": "usr_1", "name": "Rhein Sullivan"},
        {"id": "usr_2", "name": "Flask Developer"}
    ])

@app.route("/api/cms/posts", methods=["GET"])
def get_posts():
    return jsonify([
        {"id": "post_1", "title": "Welcome to Rakta.js + Flask", "published": True}
    ])

@app.route("/api/cms/posts", methods=["POST"])
def create_post():
    from datetime import datetime
    body = request.get_json() or {}
    return jsonify({
        "id": f"post_{int(datetime.now().timestamp() * 1000)}",
        "title": body.get("title", "Untitled"),
        "published": True
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    return jsonify({
        "status": "success",
        "user": {"id": "usr_1", "email": data.get("email", "admin@example.com")},
        "token": "flask_jwt_mock_token"
    })

${oauthFlaskPart}
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port, debug=True)
`;

		return [
			{ path: "backend/requirements.txt", content: requirementsContent },
			{ path: "backend/app.py", content: appPyContent },
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
				content: `# ${projectName} Backend (Flask)\n\nPython WSGI backend.\n\n## Commands\n- Install: \`pip install -r requirements.txt\`\n- Dev: \`python app.py\`\n`,
			},
		];
	},
};
