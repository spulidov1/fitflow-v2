// ============================================================================
// DATA SERVICES - All data management services
// ============================================================================

import { supabase } from './supabase';

// ============================================================================
// WEIGHT SERVICE
// ============================================================================

class WeightService {
  async getWeightHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching weight history:', error);
      return { data: [], error };
    }
  }

  async addWeightEntry(userId, weight, date, notes = '') {
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert([{
          user_id: userId,
          weight: parseFloat(weight),
          entry_date: date,
          notes: notes,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding weight entry:', error);
      return { data: null, error };
    }
  }

  async deleteWeightEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      return { error };
    }
  }

  async permanentlyDeleteWeightEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error permanently deleting weight entry:', error);
      return { error };
    }
  }

  async restoreWeightEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .update({ deleted_at: null })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error restoring weight entry:', error);
      return { error };
    }
  }

  async getDeletedEntries(userId) {
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}

// ============================================================================
// CALORIE SERVICE
// ============================================================================

class CalorieService {
  async getCalorieHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('calorie_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching calorie history:', error);
      return { data: [], error };
    }
  }

  async addCalorieEntry(userId, calories, date, mealType, notes = '') {
    try {
      const { data, error } = await supabase
        .from('calorie_entries')
        .insert([{
          user_id: userId,
          calories: parseInt(calories),
          entry_date: date,
          meal_type: mealType,
          notes: notes,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding calorie entry:', error);
      return { data: null, error };
    }
  }

  async deleteCalorieEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('calorie_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting calorie entry:', error);
      return { error };
    }
  }

  async restoreCalorieEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('calorie_entries')
        .update({ deleted_at: null })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error restoring calorie entry:', error);
      return { error };
    }
  }

  async getDeletedEntries(userId) {
    try {
      const { data, error } = await supabase
        .from('calorie_entries')
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}

// ============================================================================
// WELLNESS SERVICE
// ============================================================================

class WellnessService {
  async getWellnessHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching wellness history:', error);
      return { data: [], error };
    }
  }

  async addWellnessEntry(userId, sleepHours, waterGlasses, date) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .insert([{
          user_id: userId,
          sleep_hours: parseFloat(sleepHours),
          water_glasses: parseInt(waterGlasses),
          entry_date: date,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding wellness entry:', error);
      return { data: null, error };
    }
  }

  async deleteWellnessEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('wellness_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting wellness entry:', error);
      return { error };
    }
  }

  async restoreWellnessEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('wellness_entries')
        .update({ deleted_at: null })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error restoring wellness entry:', error);
      return { error };
    }
  }

  async getDeletedEntries(userId) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}

// ============================================================================
// MOOD SERVICE
// ============================================================================

class MoodService {
  async getMoodEntries(userId) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return { data: [], error };
    }
  }

  async addMoodEntry(userId, mood, energyLevel, notes, date) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([{
          user_id: userId,
          mood: mood,
          energy_level: parseInt(energyLevel),
          notes: notes,
          entry_date: date,
          reactions: {},
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { data: null, error };
    }
  }

  async addReaction(entryId, reactionType) {
    try {
      const { data: entry, error: fetchError } = await supabase
        .from('mood_entries')
        .select('reactions')
        .eq('id', entryId)
        .single();

      if (fetchError) throw fetchError;

      const reactions = entry.reactions || {};
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;

      const { data, error: updateError } = await supabase
        .from('mood_entries')
        .update({ reactions })
        .eq('id', entryId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { data: null, error };
    }
  }

  async deleteMoodEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      return { error };
    }
  }

  async restoreMoodEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .update({ deleted_at: null })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error restoring mood entry:', error);
      return { error };
    }
  }
}

// ============================================================================
// USER SERVICE
// ============================================================================

class UserService {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  }

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  async updatePrivacySettings(userId, privacySettings) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ privacy_settings: privacySettings })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return { data: null, error };
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { data: null, error };
    }
  }

  async deleteAccount(userId) {
    try {
      // This requires admin privileges or a database function
      // For now, we'll mark the profile as deleted
      const { error } = await supabase
        .from('profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@deleted.com` 
        })
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error };
    }
  }
}

// ============================================================================
// FAMILY SERVICE
// ============================================================================

class FamilyService {
  async createFamilyGroup(userId, groupName) {
    try {
      // Generate unique invite code
      const inviteCode = this.generateInviteCode();

      const { data, error } = await supabase
        .from('family_groups')
        .insert([{
          name: groupName,
          invite_code: inviteCode,
          admin_user_id: userId,
        }])
        .select()
        .single();

      if (error) throw error;

      // Auto-add creator as member
      await this.joinFamilyGroup(userId, data.id);

      return { data, error: null };
    } catch (error) {
      console.error('Error creating family group:', error);
      return { data: null, error };
    }
  }

  async joinFamilyGroup(userId, groupId) {
    try {
      const { data, error } = await supabase
        .from('family_group_members')
        .insert([{
          family_group_id: groupId,
          user_id: userId,
          opted_in: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error joining family group:', error);
      return { data: null, error };
    }
  }

  async joinFamilyGroupByCode(userId, inviteCode) {
    try {
      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (groupError) throw groupError;

      // Join the group
      return await this.joinFamilyGroup(userId, group.id);
    } catch (error) {
      console.error('Error joining by code:', error);
      return { data: null, error };
    }
  }

  async getFamilyGroup(userId) {
    try {
      const { data, error } = await supabase
        .from('family_group_members')
        .select('family_groups(*)')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data: data?.family_groups, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getFamilyMembers(groupId) {
    try {
      const { data, error } = await supabase
        .from('family_group_members')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .eq('family_group_id', groupId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching family members:', error);
      return { data: [], error };
    }
  }

  async updateOptInStatus(userId, groupId, optedIn) {
    try {
      const { error } = await supabase
        .from('family_group_members')
        .update({ opted_in: optedIn })
        .eq('user_id', userId)
        .eq('family_group_id', groupId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating opt-in status:', error);
      return { error };
    }
  }

  async leaveFamilyGroup(userId, groupId) {
    try {
      const { error } = await supabase
        .from('family_group_members')
        .delete()
        .eq('user_id', userId)
        .eq('family_group_id', groupId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error leaving family group:', error);
      return { error };
    }
  }

  generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

// ============================================================================
// WORKOUT SERVICE
// ============================================================================

class WorkoutService {
  async getWorkoutHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('workout_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return { data: [], error };
    }
  }

  async addWorkoutEntry(userId, exerciseName, duration, type, date) {
    try {
      const { data, error } = await supabase
        .from('workout_entries')
        .insert([{
          user_id: userId,
          exercise_name: exerciseName,
          duration_minutes: duration,
          workout_type: type,
          entry_date: date,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding workout entry:', error);
      return { data: null, error };
    }
  }

  async deleteWorkoutEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('workout_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting workout entry:', error);
      return { error };
    }
  }
}

// Export all services as singletons
export const weightService = new WeightService();
export const calorieService = new CalorieService();
export const wellnessService = new WellnessService();
export const moodService = new MoodService();
export const userService = new UserService();
export const familyService = new FamilyService();
export const workoutService = new WorkoutService(); 
