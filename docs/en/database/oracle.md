# Oracle Database

Oracle Database is an enterprise-grade relational database management system. In the Rakta.js ecosystem, Oracle is supported as a backend database for applications with existing Oracle infrastructure, typically in enterprise or government environments.

## When to Use

Use Oracle Database when:
- Your organization's existing IT infrastructure runs on Oracle
- You need enterprise features: Advanced Security, Oracle Real Application Clusters (RAC), or Active Data Guard
- Your application requires PL/SQL stored procedures, Oracle-specific analytics functions, or partitioned tables
- You are integrating Rakta.js with a Java (Spring Boot / Jakarta EE) backend that already uses Oracle

For new projects without an Oracle requirement, PostgreSQL is recommended.

## Installation

### Node.js / Bun

```bash
bun add oracledb
```

The `oracledb` module requires Oracle Instant Client libraries to be installed on the server. Download from [Oracle's website](https://www.oracle.com/database/technologies/instant-client.html) or install via package manager.

```bash
# macOS (Homebrew)
brew install instantclient-basic

# Set LD_LIBRARY_PATH (Linux)
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_9:$LD_LIBRARY_PATH
```

### PHP (Laravel / CodeIgniter 4)

Enable the `oci8` or `pdo_oci` extension in `php.ini`:

```ini
extension=oci8
; or
extension=pdo_oci
```

### Python (Django / Flask)

```bash
pip install oracledb
```

### Go (Prabogo / Beego)

```bash
go get github.com/godror/godror
```

### Java (Spring Boot)

```xml
<dependency>
  <groupId>com.oracle.database.jdbc</groupId>
  <artifactId>ojdbc11</artifactId>
  <scope>runtime</scope>
</dependency>
```

## Configuration

```env
ORACLE_USER=admin
ORACLE_PASSWORD=secret_password
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
# For Oracle Cloud Autonomous Database with TLS wallet:
ORACLE_WALLET_LOCATION=/app/wallet
```

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── employees/
│   │       └── page.tsx
│   └── services/
│       └── employees.ts
├── backend/                # Node.js / Gaman.js or Spring Boot
│   ├── routes/
│   │   └── employees.ts
│   ├── services/
│   │   └── employeeService.ts
│   └── db/
│       └── oracle.ts       # oracledb connection pool
```

## Backend Integration

### Node.js + oracledb (connection pool)

```typescript
// backend/db/oracle.ts
import oracledb from "oracledb";

// Use connection pool for production workloads
let pool: oracledb.Pool | null = null;

export async function getPool(): Promise<oracledb.Pool> {
  if (pool) return pool;

  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER!,
    password: process.env.ORACLE_PASSWORD!,
    connectString: process.env.ORACLE_CONNECT_STRING!,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  });

  return pool;
}

export async function query<T = unknown>(
  sql: string,
  binds: unknown[] = [],
  opts?: oracledb.ExecuteOptions
): Promise<T[]> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute<T[]>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...opts,
    });
    return (result.rows ?? []) as unknown as T[];
  } finally {
    await conn.close();
  }
}
```

```typescript
// backend/services/employeeService.ts
import { query } from "../db/oracle";

export interface Employee {
  ID: number;
  FULL_NAME: string;
  DEPARTMENT: string;
  SALARY: number;
  HIRE_DATE: string;
}

export async function getAllEmployees(): Promise<Employee[]> {
  return query<Employee>(
    "SELECT ID, FULL_NAME, DEPARTMENT, SALARY, HIRE_DATE FROM EMPLOYEES WHERE STATUS = :status ORDER BY FULL_NAME",
    ["ACTIVE"]
  );
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const rows = await query<Employee>(
    "SELECT ID, FULL_NAME, DEPARTMENT, SALARY, HIRE_DATE FROM EMPLOYEES WHERE ID = :id",
    [id]
  );
  return rows[0] ?? null;
}
```

```typescript
// backend/routes/employees.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getAllEmployees, getEmployeeById } from "../services/employeeService";

export default defineRoute({
  "GET /api/employees": async (ctx) => {
    const employees = await getAllEmployees();
    return ctx.json({ employees });
  },
  "GET /api/employees/:id": async (ctx) => {
    const employee = await getEmployeeById(Number(ctx.params.id));
    if (!employee) return ctx.json({ error: "Not found" }, 404);
    return ctx.json({ employee });
  },
});
```

### Java Spring Boot Integration

```java
// src/main/java/com/example/service/EmployeeService.java
@Service
public class EmployeeService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Employee> findAll() {
        return jdbcTemplate.query(
            "SELECT id, full_name, department, salary FROM employees WHERE status = 'ACTIVE'",
            (rs, rowNum) -> new Employee(
                rs.getLong("id"),
                rs.getString("full_name"),
                rs.getString("department"),
                rs.getBigDecimal("salary")
            )
        );
    }
}
```

```java
// src/main/java/com/example/controller/EmployeeController.java
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "${rakta.frontend.url}")
public class EmployeeController {
    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        List<Employee> employees = employeeService.findAll();
        return ResponseEntity.ok(Map.of("employees", employees));
    }
}
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/employees.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:8080" });

export interface Employee {
  id: number;
  full_name: string;
  department: string;
  salary: number;
  hire_date: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const data = await api.get<{ employees: Employee[] }>("/api/employees");
  return data.employees;
}
```

```tsx
// frontend/app/employees/page.tsx
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees().then(setEmployees);
  }, []);

  return (
    <main>
      <title>Employees</title>
      <lazy fallback={<p>Loading employees...</p>}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>
                  <click to={`/employees/${e.id}`}>{e.full_name}</click>
                </td>
                <td>{e.department}</td>
                <td>${e.salary.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </lazy>
    </main>
  );
}
```

## PL/SQL Stored Procedures

```typescript
// Call a stored procedure from Node.js
import oracledb from "oracledb";
import { getPool } from "../db/oracle";

export async function getEmployeeReport(deptId: number) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute(
      "BEGIN get_department_report(:dept_id, :cursor); END;",
      {
        dept_id: deptId,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    // Process the REF CURSOR
    const cursor = result.outBinds?.cursor as oracledb.ResultSet<unknown[]>;
    const rows = await cursor.getRows(100);
    await cursor.close();
    return rows;
  } finally {
    await conn.close();
  }
}
```

## Development

Run Oracle Database Express Edition (XE) locally:

```bash
docker run -d \
  --name oracle-dev \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=secret \
  gvenzl/oracle-xe:21-slim
```

```env
ORACLE_USER=system
ORACLE_PASSWORD=secret
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

## Production

- **Oracle Cloud Autonomous Database** - fully managed Oracle with automatic tuning
- **Oracle Cloud Infrastructure** - VMs with Oracle DB installed
- For TLS wallet connections (Autonomous DB), set `ORACLE_WALLET_LOCATION` to the unzipped wallet directory

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Spring Boot)
  ↓ oracledb connection pool / JdbcTemplate
Oracle Database (PL/SQL + SQL92)
  ↓ result set rows
JSON response
  ↓
Rakta.js UI
```
