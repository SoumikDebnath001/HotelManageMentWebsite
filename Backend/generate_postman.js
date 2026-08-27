const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'routes/v1');
const CONTROLLERS_DIR = path.join(__dirname, 'controllers');
const OUTPUT_FILE = path.join(__dirname, 'Hotel-Management-System.postman_collection.json');

const collection = {
  info: {
    name: "Hotel Management System",
    description: "API collection for Hotel Management System.\n\nAuthentication: protected routes require:\n- authorization: <stored token>\n- usertype: SuperAdmin | Admin | Employee | User\n\nUse superAdminToken for platform administration, adminToken for hotel-owner administration, managerToken for an assigned Manager, and userToken for normal Users. Manager hotel scope is derived from the authenticated Manager; do not rely on a submitted hotelId.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:6587" },
    { key: "superAdminToken", value: "" },
    { key: "adminToken", value: "" },
    { key: "managerToken", value: "" },
    { key: "userToken", value: "" }
  ],
  item: []
};

// Map file to collection folder
const folderMap = {
  'admin.js': 'Admin',
  'employee.js': 'Employee',
  'manager.js': 'Manager',
  'superadmin.js': 'SuperAdmin',
  'user.js': 'User',
  'index.js': 'Public'
};

// Regex to match router definitions
// e.g. router.post('/login', controller.login);
const routeRegex = /router\.(get|post|put|delete|patch)\(\s*['"`](.*?)['"`]\s*,\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g;

// To resolve controller names to files, we need to find the requires in the route file
const requireRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"`](.*?)['"`]\)/g;

// To parse Validator inside controller
const validatorRegex = /new\s+Validator\([^,]+,\s*({[\s\S]*?})\s*\)/;

function getSampleValue(rules, field) {
  if (rules.includes('email')) return "test@example.com";
  if (field.toLowerCase().includes('password')) return "password123";
  if (field.toLowerCase().includes('id')) return "60d5ec49f1b2c8b1f8e12345";
  if (rules.includes('numeric') || rules.includes('integer')) return 1;
  if (rules.includes('boolean')) return true;
  return "sample_string";
}

const folders = {};
Object.values(folderMap).forEach(f => {
  folders[f] = { name: f, item: [] };
});

fs.readdirSync(ROUTES_DIR).forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(ROUTES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Parse requires
  const controllers = {};
  let match;
  while ((match = requireRegex.exec(content)) !== null) {
    const varName = match[1];
    let reqPath = match[2];
    controllers[varName] = reqPath;
  }

  // Parse routes
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let endpoint = match[2];
    const ctrlName = match[3];
    const funcName = match[4];

    // Determine path
    let fullPath = `/api/v1`;
    const folderName = folderMap[file];
    
    if (file === 'index.js') {
        fullPath += endpoint;
    } else {
        fullPath += `/${file.replace('.js', '')}${endpoint}`;
    }

    let requestBody = {};
    
    // Try to find the controller file and parse Validator
    if (controllers[ctrlName]) {
      const ctrlRelPath = controllers[ctrlName];
      let ctrlAbsPath = path.join(path.dirname(filePath), ctrlRelPath);
      if (!ctrlAbsPath.endsWith('.js')) ctrlAbsPath += '.js';

      if (fs.existsSync(ctrlAbsPath)) {
        const ctrlContent = fs.readFileSync(ctrlAbsPath, 'utf8');
        
        // Find the function definition
        const funcRegex = new RegExp(`const\\s+${funcName}\\s*=\\s*(async\\s*)?\\([^)]*\\)\\s*=>\\s*{([\\s\\S]*?)(?=^const|module\\.exports)`, 'm');
        const funcMatch = ctrlContent.match(funcRegex);
        
        if (funcMatch) {
          const funcBody = funcMatch[2];
          const valMatch = funcBody.match(validatorRegex);
          if (valMatch) {
            try {
              // Extremely naive parsing of the validator object
              const objStr = valMatch[1]
                .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
                .replace(/'/g, '"');
              // use eval to parse the JS object string (since it might not be strict JSON)
              const rulesObj = eval(`(${valMatch[1]})`);
              
              for (const [key, rules] of Object.entries(rulesObj)) {
                requestBody[key] = getSampleValue(rules, key);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }

    const postmanItem = {
      name: endpoint.replace(/^\//, ''),
      request: {
        method: method,
        header: [
          { key: "Authorization", value: "{{adminToken}}", type: "text" },
          { key: "usertype", value: "Admin", type: "text" }
        ],
        url: {
          raw: `{{baseUrl}}${fullPath}`,
          host: ["{{baseUrl}}"],
          path: fullPath.split('/').filter(p => p)
        }
      },
      response: []
    };

    // Fix tokens based on folder
    if (folderName === 'SuperAdmin') {
      postmanItem.request.header[0].value = "{{superAdminToken}}";
      postmanItem.request.header[1].value = "SuperAdmin";
    } else if (folderName === 'Manager') {
      postmanItem.request.header[0].value = "{{managerToken}}";
      postmanItem.request.header[1].value = "Manager";
    } else if (folderName === 'User') {
      postmanItem.request.header[0].value = "{{userToken}}";
      postmanItem.request.header[1].value = "User";
    } else if (folderName === 'Employee') {
      postmanItem.request.header[0].value = "{{employeeToken}}";
      postmanItem.request.header[1].value = "Employee";
    } else if (folderName === 'Public') {
      postmanItem.request.header = []; // No auth required for public
    }

    if (method !== 'GET' && Object.keys(requestBody).length > 0) {
      postmanItem.request.body = {
        mode: "raw",
        raw: JSON.stringify(requestBody, null, 2),
        options: { raw: { language: "json" } }
      };
    } else if (method !== 'GET') {
      postmanItem.request.body = {
        mode: "raw",
        raw: "{\n  \n}",
        options: { raw: { language: "json" } }
      };
    }

    folders[folderName].item.push(postmanItem);
  }
});

collection.item = Object.values(folders);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 2));
console.log('Postman collection updated successfully!');
