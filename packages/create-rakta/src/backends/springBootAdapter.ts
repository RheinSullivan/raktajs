import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const springBootCapabilities: BackendCapabilities = {
	framework: "spring-boot",
	language: "Java",
	runtime: "JVM (Java 17 / Java 21)",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "h2", "oracle"],
	authentication: "Spring Security / JWT",
	middleware: "Spring Web Filters / Interceptors",
	validation: "Jakarta Validation (Hibernate Validator)",
	apiType: "REST",
	developmentCommand: "./mvnw spring-boot:run",
	productionCommand: "java -jar target/app.jar",
	databaseDriver: "Spring Data JPA / Hibernate",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const springBootAdapter: BackendAdapter = {
	identifier: "spring-boot",
	name: "Spring Boot",
	language: "Java",
	runtime: "Java / JVM",
	capabilities: springBootCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>
    <groupId>com.rakta</groupId>
    <artifactId>${projectName}-backend</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <name>${projectName}-backend</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;

		const applicationJavaContent = `package com.rakta.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`;

		const healthControllerJavaContent = `package com.rakta.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {
    @GetMapping
    public Map<String, String> healthCheck() {
        return Map.of(
            "status", "ok",
            "framework", "Spring Boot 3",
            "language", "Java"
        );
    }
}
`;

		const userControllerJavaContent = `package com.rakta.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping
    public List<Map<String, String>> getUsers() {
        return List.of(
            Map.of("id", "usr_1", "name", "Rhein Sullivan"),
            Map.of("id", "usr_2", "name", "Spring Boot Developer")
        );
    }
}
`;

		const applicationPropertiesContent = `server.port=4000
spring.application.name=${projectName}-backend
`;

		return [
			{ path: "backend/pom.xml", content: pomXmlContent },
			{ path: "backend/src/main/resources/application.properties", content: applicationPropertiesContent },
			{ path: "backend/src/main/java/com/rakta/app/Application.java", content: applicationJavaContent },
			{ path: "backend/src/main/java/com/rakta/app/controller/HealthController.java", content: healthControllerJavaContent },
			{ path: "backend/src/main/java/com/rakta/app/controller/UserController.java", content: userControllerJavaContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Spring Boot 3)\n\nEnterprise Spring Boot Java backend.\n\n## Commands\n- Dev: \`./mvnw spring-boot:run\`\n- Build: \`./mvnw clean package\`\n`,
			},
		];
	},
};
