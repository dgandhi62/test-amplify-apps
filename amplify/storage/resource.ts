import { defineStorage } from "@aws-amplify/backend";

const AMPLIFY_GEN_1_ENV_NAME = process.env.AMPLIFY_GEN_1_ENV_NAME ?? "sandbox";

export const storage = defineStorage({ name: `dgtestapp143bdc2e9dcc74010b032b2621951789a84894-${AMPLIFY_GEN_1_ENV_NAME}`, access: allow => ({
        "public/*": [allow.guest.to(["read"]), allow.authenticated.to(["write", "read"])],
        "protected/{entity_id}/*": [allow.authenticated.to(["write", "read"])],
        "private/{entity_id}/*": [allow.authenticated.to(["write", "read"])]
    }) });
