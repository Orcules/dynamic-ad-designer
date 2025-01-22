import { initialize_gspread, initialize_storage, create_image } from '../python/adGenerator';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = JSON.parse(formData.get('data') as string);
    const image = formData.get('image') as File;

    if (image) {
      // Convert File to image URL or handle file upload
      data['Image Link'] = await uploadImage(image);
    }

    const data_sheet, db_sheet = await initialize_gspread();
    const bucket = await initialize_storage();
    
    await create_image([data], db_sheet, bucket);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-ad API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate ad' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function uploadImage(file: File): Promise<string> {
  // Implement image upload logic here
  // Return the URL of the uploaded image
  return '';
}