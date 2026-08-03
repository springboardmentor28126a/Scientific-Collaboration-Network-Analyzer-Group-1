ROLE_PERMISSIONS = {

    "Researcher": {

        "publication:create",
        "publication:update",
        "publication:delete",

        "conference:create",
        "conference:update",
        "conference:delete",

        "group:create",
        "group:update",
        "group:delete",
        "group:invite",
        "meeting:create",
        "meeting:update",
        "meeting:delete",
        "meeting:view",

        "chat:private",
        "chat:group"
    },

    "Reviewer": {

        "publication:review",
        "publication:approve",
        "publication:reject",

        "chat:private"
    },

    "Student": {

        "publication:view",

        "group:join",

        "chat:private",
        "chat:group",

        "meeting:view"
    },

    "Faculty": {

    "institution:update",

    "researcher:view",
    "researcher:update",

    "student:view",
    "student:update",

    "verification:approve",

    "chat:private"

},

    "System Admin": {

        "*"

    }

}
