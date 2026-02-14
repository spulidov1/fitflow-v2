// ============================================================================
// PHOTO SERVICE - Handle photo uploads to Supabase Storage
// ============================================================================

import { supabase } from './supabase';
import { generateUniqueFileName, isValidImage } from '../utils/helpers';
import imageCompression from 'browser-image-compression';

class PhotoService {
  constructor() {
    this.bucketName = 'progress-photos';
  }

  /**
   * Get all photos for a user
   */
  async getPhotos(userId) {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('photo_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching photos:', error);
      return { data: [], error };
    }
  }

  /**
   * Compress image before upload
   */
  async compressImage(file) {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original if compression fails
    }
  }

  /**
   * Upload photo to Supabase Storage
   */
  async uploadPhoto(userId, file, photoDate, notes = '') {
    try {
      // Validate image
      const validation = isValidImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Compress image
      const compressedFile = await this.compressImage(file);

      // Generate unique filename
      const fileName = generateUniqueFileName(userId, file.name);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data: photoData, error: dbError } = await supabase
        .from('progress_photos')
        .insert([{
          user_id: userId,
          photo_url: publicUrl,
          storage_path: fileName,
          photo_date: photoDate,
          notes: notes,
          reactions: {},
        }])
        .select()
        .single();

      if (dbError) {
        // If database insert fails, clean up uploaded file
        await this.deleteFromStorage(fileName);
        throw dbError;
      }

      return { data: photoData, error: null };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete photo (soft delete)
   */
  async deletePhoto(photoId, userId) {
    try {
      // Get photo details first
      const { data: photo, error: fetchError } = await supabase
        .from('progress_photos')
        .select('storage_path')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Soft delete in database
      const { error: updateError } = await supabase
        .from('progress_photos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', photoId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return { data: { storagePath: photo.storage_path }, error: null };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { data: null, error };
    }
  }

  /**
   * Permanently delete photo from storage and database
   */
  async permanentlyDeletePhoto(photoId, userId) {
    try {
      // Get photo details
      const { data: photo, error: fetchError } = await supabase
        .from('progress_photos')
        .select('storage_path')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (photo.storage_path) {
        await this.deleteFromStorage(photo.storage_path);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (error) {
      console.error('Error permanently deleting photo:', error);
      return { error };
    }
  }

  /**
   * Restore soft-deleted photo
   */
  async restorePhoto(photoId, userId) {
    try {
      const { error } = await supabase
        .from('progress_photos')
        .update({ deleted_at: null })
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error restoring photo:', error);
      return { error };
    }
  }

  /**
   * Get soft-deleted photos
   */
  async getDeletedPhotos(userId) {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching deleted photos:', error);
      return { data: [], error };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFromStorage(path) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting from storage:', error);
      return { error };
    }
  }

  /**
   * Add reaction to photo
   */
  async addReaction(photoId, reactionType) {
    try {
      // Get current reactions
      const { data: photo, error: fetchError } = await supabase
        .from('progress_photos')
        .select('reactions')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      // Update reactions
      const reactions = photo.reactions || {};
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;

      // Save updated reactions
      const { data, error: updateError } = await supabase
        .from('progress_photos')
        .update({ reactions })
        .eq('id', photoId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { data: null, error };
    }
  }

  /**
   * Get photo by ID
   */
  async getPhotoById(photoId, userId) {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching photo:', error);
      return { data: null, error };
    }
  }

  /**
   * Update photo notes
   */
  async updatePhotoNotes(photoId, userId, notes) {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .update({ notes })
        .eq('id', photoId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating photo notes:', error);
      return { data: null, error };
    }
  }
}

export default new PhotoService();
