# posts/cloudinary_fix.py
import os
import cloudinary
import cloudinary.uploader
from django.conf import settings

def upload_video_directly(file_path, public_id=None):
    """
    Загружает видео напрямую в Cloudinary с правильным resource_type
    """
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
    )
    
    # Upload with explicit video resource type
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="video",
        public_id=public_id,
        folder="post_media"
    )
    
    return result