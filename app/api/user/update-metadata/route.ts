import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { publicMetadata } = body;

        // Validate that publicMetadata is an object
        if (!publicMetadata || typeof publicMetadata !== "object") {
            return NextResponse.json(
                { error: "Invalid metadata format" },
                { status: 400 }
            );
        }

        // Update user metadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user metadata:", error);
        return NextResponse.json(
            { error: "Failed to update metadata" },
            { status: 500 }
        );
    }
}

