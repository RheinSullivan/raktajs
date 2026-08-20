import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

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

		const requirementsContent = `flask>=3.0.0
flask-cors>=4.0.0
pyjwt>=2.8.0
python-dotenv>=1.0.0
`;

		const appPyContent = `from flask import Flask, jsonify, request
from flask_cors import CORS
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

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    return jsonify({
        "status": "success",
        "user": {"id": "usr_1", "email": data.get("email", "admin@example.com")},
        "token": "flask_jwt_mock_token"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port, debug=True)
`;

		return [
			{ path: "backend/requirements.txt", content: requirementsContent },
			{ path: "backend/app.py", content: appPyContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Flask)\n\nPython WSGI backend.\n\n## Commands\n- Install: \`pip install -r requirements.txt\`\n- Dev: \`python app.py\`\n`,
			},
		];
	},
};
