import type { APIRoute } from "astro";
import cloudinary from "../../config/cloudinary";

export const POST: APIRoute = async ({ request }) => {
    const body = await request.formData().catch((err) => {
        console.error(err);
        return null;
    });
    if (!body || !body.has("image")) {
        return new Response(JSON.stringify({
            error: "Invalid request",
        }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const image = body.get("image") as File;
    if (!image.type.startsWith("image/")) {
        return new Response(JSON.stringify({
            error: "Invalid image type",
        }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    // Limit the image size to 10MB
    if (image.size > 4 * 1024 * 1024) {
        return new Response(JSON.stringify({
            error: "Image too large",
        }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    try {
        // Convert File to base64
        const arrayBuffer = await image.arrayBuffer();
        const base64Image = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataURI = `data:${image.type};base64,${base64Image}`;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            use_filename: false,
            unique_filename: true,
            folder: "hackathon",
        });

        // Transform image
        const getTransformedImage = await fetch(`https://res.cloudinary.com/dg7xhhwrl/image/upload/e_gen_replace:from_face;to_Shattered face of creepy zombie scream;preserve-geometry_false/v1671769343/${uploadResponse.public_id}.png`);
        const transformedImage = await getTransformedImage.blob().finally(() => {
            // Delete the uploaded image from Cloudinary
            cloudinary.uploader.destroy(uploadResponse.public_id);
        });


        return new Response(transformedImage, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-length': transformedImage.size.toString(),
            }
        })
    } catch (error) {
        console.error("Error processing upload:", error);
        return new Response(JSON.stringify({
            error: "Server error",
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    /*  return new Response(JSON.stringify({
         error: "Server error",
     }), { status: 500, headers: { "Content-Type": "application/json" } }); */
}   