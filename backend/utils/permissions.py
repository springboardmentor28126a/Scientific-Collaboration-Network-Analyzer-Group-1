ROLE_PERMISSIONS = {

    "Researcher": {

        "publication:view",
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
        ,"analytics:view"
    },

    "Institution Admin": {
        "institution:update",
        "institution:delete",
        "researcher:view",
        "student:view",
        "publication:view",
        "analytics:view",
        "chat:private",
    },

    "Reviewer": {

        "publication:view",
        "publication:review",
        "publication:approve",
        "publication:reject",

        "chat:private",
        "analytics:view"
    },

    "Student": {

        "publication:view",
        "analytics:view",

        "group:join",

        "chat:private",
        "chat:group",

        "meeting:view"
    },

    "Faculty": {

    "researcher:view",
    "researcher:update",

    "student:view",
    "student:update",

    "verification:approve",

    "chat:private"
    ,"analytics:view"

},

    "System Admin": {

        "*"

    }

}
