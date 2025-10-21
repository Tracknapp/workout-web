import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { data, type } = await request.json();
  console.log("Clerk webhook received", data, type);
  switch (type) {
    case "user.created":
      await ctx.runMutation(internal.user.createUser, {
        clerkId: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email_addresses[0].email_address,
        profilePicture: data.image_url,
        gender: data.gender,
      });
      break;
    case "user.updated":
      break;
  }
  return new Response(null, { status: 200 });
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});
export default http;
