import { RemovalPolicy, Tags } from "aws-cdk-lib";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { defineBackend } from "@aws-amplify/backend";
import ci from "ci-info";
import { Duration } from "aws-cdk-lib";
import { OAuthScope, UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";


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

const { amplifyDynamoDbTables } = backend.data.resources.cfnResources;
for (const table of Object.values(amplifyDynamoDbTables)) {
  table.deletionProtectionEnabled = false;
}

// backend.auth.resources.userPool.node.tryRemoveChild("UserPoolDomain");
// Tags.of(backend.stack).add("gen1-migrated-app", "true");
