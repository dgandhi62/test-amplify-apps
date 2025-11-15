import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { defineBackend } from "@aws-amplify/backend";
import { Duration } from "aws-cdk-lib";
import { OAuthScope, UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";


const backend = defineBackend({
    auth,
    data,
    storage
});
const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
cfnUserPool.usernameAttributes = ["email", "phone_number"];
cfnUserPool.policies = {
    passwordPolicy: {
        minimumLength: 8,
        requireLowercase: false,
        requireNumbers: false,
        requireSymbols: false,
        requireUppercase: false,
        temporaryPasswordValidityDays: 7
    }
};
const cfnIdentityPool = backend.auth.resources.cfnResources.cfnIdentityPool;
const cfnUserPoolClient = backend.auth.resources.cfnResources.cfnUserPoolClient;
cfnUserPoolClient.allowedOAuthFlows = ["code"];
const userPool = backend.auth.resources.userPool;
const userPoolClient = userPool.addClient("NativeAppClient", {
    oAuth: {
        flows: { authorizationCodeGrant: true, implicitCodeGrant: false, clientCredentials: false },
        scopes: [
            OAuthScope.COGNITO_ADMIN,
            OAuthScope.EMAIL,
            OAuthScope.OPENID,
            OAuthScope.PHONE,
            OAuthScope.PROFILE
        ],
        callbackUrls: ["https://localhost:5173/"],
        logoutUrls: ["https://localhost:5173/"]
    },
    disableOAuth: false,
    authSessionValidity: Duration.minutes(3),
    userPoolClientName: "dgtest9f0b241e_app_client",
    enablePropagateAdditionalUserContextData: false,
    enableTokenRevocation: true,
    refreshTokenValidity: Duration.days(30),
    supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.GOOGLE
    ],
    generateSecret: false
});
const s3Bucket = backend.storage.resources.cfnResources.cfnBucket;
s3Bucket.bucketEncryption = {
    serverSideEncryptionConfiguration: [
        {
            serverSideEncryptionByDefault: {
                sseAlgorithm: "AES256"
            },
            bucketKeyEnabled: false
        }
    ]
};
const providerSetupResult = (backend.auth.stack.node.children.find(child => child.node.id === "amplifyAuth") as any).providerSetupResult;
Object.keys(providerSetupResult).forEach(provider => {
    const providerSetupPropertyValue = providerSetupResult[provider];
    if (providerSetupPropertyValue.node && providerSetupPropertyValue.node.id.toLowerCase().endsWith("idp")) {
        userPoolClient.node.addDependency(providerSetupPropertyValue);
    }
});
// Access CFN tables directly from cfnResources
console.log('backend: ', backend)
console.log('backend.data: ', backend.data)
console.log('backend.data.resources: ', backend.data.resources)
console.log('backend.data.resources.cfnResources: ', backend.data.resources.cfnResources)
console.log('backend.data.resources.cfnResources.amplifyDynamoDbTables', backend.data.resources.cfnResources.amplifyDynamoDbTables)


// Try accessing through the data stack directly
console.log('backend.data.stack.node.children:', backend.data.stack.node.children);

// Access the GraphQL API
const graphqlApi = backend.data.resources.cfnResources.cfnGraphqlApi;
console.log('GraphQL API:', graphqlApi);

console.log('backend.data.resources.tables:', backend.data.resources.tables);

// Check nested stacks for tables
console.log('backend.data.resources.nestedStacks:', backend.data.resources.nestedStacks);

// Check all cfnResources keys
console.log('backend.data.resources.cfnResources.additionalCfnResources', Object.keys(backend.data.resources.cfnResources.additionalCfnResources));

console.log('backend.data.resources.cfnResources.cfnTables', Object.keys(backend.data.resources.cfnResources.cfnTables));

// Look for tables in the data stack children
backend.data.stack.node.children.forEach(child => {
  console.log('Stack child:', child.node.id, child.constructor.name);
  if (child.node.id.includes('Table') || child.node.id.includes('DynamoDB')) {
    console.log('Found table-related resource:', child);
  }
});

if (backend.data.resources.cfnResources.amplifyDynamoDbTables) {
  for (const [tableName, cfnTable] of Object.entries(backend.data.resources.cfnResources.amplifyDynamoDbTables)) {
    cfnTable.deletionProtectionEnabled = false;
    console.log(`Set deletionProtectionEnabled=false for ${tableName}`);
  }
} else {
  console.log('No amplifyDynamoDbTables found in cfnResources');
}


