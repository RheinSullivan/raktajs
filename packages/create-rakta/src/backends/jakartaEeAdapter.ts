import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const jakartaEeCapabilities: BackendCapabilities = {
	framework: "jakarta-ee",
	language: "Java",
	runtime: "JVM / Jakarta EE Application Server (Payara / WildFly / Liberty)",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "oracle", "db2"],
	authentication: "Jakarta Security (SecurityContext / CallerPrincipal)",
	middleware: "Jakarta RESTful Web Services Filters (ContainerRequestFilter)",
	validation: "Jakarta Validation (ConstraintValidator)",
	apiType: "Jakarta REST (JAX-RS) / CDI",
	developmentCommand: "mvn package && payara micro target/app.war",
	productionCommand: "java -jar payara-micro.jar --deploy target/app.war",
	databaseDriver: "Jakarta Persistence (JPA)",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const jakartaEeAdapter: BackendAdapter = {
	identifier: "jakarta-ee",
	name: "Jakarta EE / J2EE",
	language: "Java",
	runtime: "Java / JVM",
	capabilities: jakartaEeCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.rakta</groupId>
    <artifactId>${projectName}-backend</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>war</packaging>
    <name>${projectName}-backend</name>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>jakarta.platform</groupId>
            <artifactId>jakarta.jakartaee-api</artifactId>
            <version>10.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <finalName>${projectName}-backend</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
            </plugin>
        </plugins>
    </build>
</project>
`;

		const restApplicationJavaContent = `package com.rakta.jakarta;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/")
public class RestApplication extends Application {
}
`;

		const healthResourceJavaContent = `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/health")
public class HealthResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkHealth() {
        Map<String, String> payload = Map.of(
            "status", "ok",
            "framework", "Jakarta EE 10",
            "historicalStandard", "J2EE -> Java EE -> Jakarta EE"
        );
        return Response.ok(payload).build();
    }
}
`;

		const userResourceJavaContent = `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/users")
public class UserResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUsers() {
        List<Map<String, String>> users = List.of(
            Map.of("id", "usr_1", "name", "Rhein Sullivan"),
            Map.of("id", "usr_2", "name", "Jakarta EE Developer")
        );
        return Response.ok(users).build();
    }
}
`;

		const webXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
    <display-name>${projectName} Jakarta EE Backend</display-name>
</web-app>
`;

		return [
			{ path: "backend/pom.xml", content: pomXmlContent },
			{ path: "backend/src/main/webapp/WEB-INF/web.xml", content: webXmlContent },
			{ path: "backend/src/main/java/com/rakta/jakarta/RestApplication.java", content: restApplicationJavaContent },
			{ path: "backend/src/main/java/com/rakta/jakarta/resource/HealthResource.java", content: healthResourceJavaContent },
			{ path: "backend/src/main/java/com/rakta/jakarta/resource/UserResource.java", content: userResourceJavaContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Jakarta EE / J2EE)\n\nStandardized Jakarta EE 10 web application.\n\nHistorical Evolution: J2EE -> Java EE -> Jakarta EE\n\n## Commands\n- Build: \`mvn clean package\`\n`,
			},
		];
	},
};
