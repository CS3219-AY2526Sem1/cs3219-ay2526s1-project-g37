from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.crud import upload_image_and_get_url

router = APIRouter(
    prefix="/images",
    tags=["images"],
)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    '''
    Endpoint to upload an image and get its URL.
    Expects a multipart/form-data request with the image file.
    Returns the URL of the uploaded image.
    '''
    try:
        contents = await file.read()
        url = upload_image_and_get_url(contents, file.filename)
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload image:" + str(e))
