import { defineAuth, secret } from "@aws-amplify/backend";

export const auth = defineAuth({
    loginWith: {
        email: {
            verificationEmailSubject: "Your verification code",
            verificationEmailBody: () => "Your verification code is {####}"
        },
        externalProviders: {
            google: {
                clientId: secret("GOOGLE_CLIENT_ID"),
                clientSecret: secret("GOOGLE_CLIENT_SECRET"),
                attributeMapping: {
                    email: "email"
                },
                scopes: ["aws.cognito.signin.user.admin", "email", "openid", "phone", "profile"]
            },
            callbackUrls: ["https://localhost:5173/"],
            logoutUrls: ["https://localhost:5173/"]
        }
    },
    userAttributes: {
        email: {
            required: true,
            mutable: true
        }
    },
    multifactor: {
        mode: "OFF"
    }
});
