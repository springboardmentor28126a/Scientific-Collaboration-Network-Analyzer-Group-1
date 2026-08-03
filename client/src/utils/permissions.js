const permissions = {

    Researcher: [

        // Publications
        "publication:create",
        "publication:update",
        "publication:delete",
        "publication:view",
        "publication:submit",

        // Conferences
        "conference:create",
        "conference:update",
        "conference:delete",

        // Research Groups
        "group:create",
        "group:view",

        // Meetings
        "meeting:create",
        "meeting:view",

        // Chat
        "chat:view",
        "chat:send",

        // Analytics
        "analytics:view",

        // Network Graph
        "network:view",

        // Verification
        "verification:upload",
        "verification:view"

    ],

    Reviewer: [

        // Publications
        "publication:review",
        "publication:approve",
        "publication:reject",
        "publication:view",

        // Chat
        "chat:view",
        "chat:send",

        // Analytics
        "analytics:view"

    ],

    Faculty: [

        // Institution
        "institution:update",
        "institution:view",

        // Researchers
        "researcher:view",
        "researcher:update",

        // Students
        "student:view",
        "student:update",

        // Verification
        "verification:view",

        // Analytics
        "analytics:view"

    ],

    Student: [

        // Publications
        "publication:view",

        // Research Groups
        "group:view",
        "group:join",

        // Meetings
        "meeting:view",

        // Chat
        "chat:view",
        "chat:send",

        // Verification
        "verification:upload",
        "verification:view"

    ],

    "System Admin": [

        "*"

    ]

};

export function hasPermission(permission) {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) return false;

    const rolePermissions =
        permissions[user.role] || [];

    return (

        rolePermissions.includes("*") ||

        rolePermissions.includes(permission)

    );

}
