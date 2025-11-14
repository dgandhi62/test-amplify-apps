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
for (const [tableName, table] of Object.entries(backend.data.resources.tables)) {
  console.log(`Table ${tableName}:`);
  console.log('- defaultChild:', table.node.defaultChild?.constructor.name);
  console.log('- children:', table.node.children.map(c => c.constructor.name));
  
  // Try different approaches
  const cfnTable = table.node.defaultChild as any;
  if (cfnTable && cfnTable.deletionProtectionEnabled !== undefined) {
    cfnTable.deletionProtectionEnabled = false;
    console.log(`Set deletionProtectionEnabled=false for ${tableName}`);
  } else {
    // Try finding CfnTable in children
    const cfnTableChild = table.node.children.find(child => 
      child.constructor.name === 'CfnTable'
    ) as any;
    if (cfnTableChild) {
      cfnTableChild.deletionProtectionEnabled = false;
      console.log(`Set deletionProtectionEnabled=false for ${tableName} via children`);
    }
  }
}


