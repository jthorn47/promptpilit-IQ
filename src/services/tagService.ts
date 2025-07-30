/**
 * Universal Tag Service
 * Provides CRUD operations and management for the platform-wide tag system
 */

import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  tag_name: string;
  tag_color: string;
  tag_type: string;
  description?: string;
  scope: 'global' | 'company' | 'team';
  company_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
}

export interface TaggableEntity {
  id: string;
  tag_id: string;
  entity_type: string;
  entity_id: string;
  tagged_by: string;
  tagged_at: string;
}

export interface EntityTag {
  tag_id: string;
  tag_name: string;
  tag_color: string;
  tag_type: string;
  tagged_at: string;
}

export type EntityType = 'client' | 'proposal' | 'case' | 'document' | 'training_assignment' | 'company';

export class TagService {
  /**
   * Search and filter tags
   */
  static async searchTags(params: {
    searchTerm?: string;
    tagType?: string;
    scope?: string;
    companyId?: string;
    limit?: number;
  } = {}): Promise<Tag[]> {
    const { searchTerm = '', tagType, scope, companyId, limit = 50 } = params;

    const { data, error } = await supabase.rpc('search_tags', {
      p_search_term: searchTerm,
      p_tag_type: tagType || null,
      p_scope: scope || null,
      p_company_id: companyId || null
    });

    if (error) {
      console.error('Error searching tags:', error);
      throw new Error('Failed to search tags');
    }

    return (data?.slice(0, limit) || []).map(tag => ({
      id: tag.id,
      tag_name: tag.tag_name,
      tag_color: tag.tag_color,
      tag_type: tag.tag_type,
      scope: tag.scope as 'global' | 'company' | 'team',
      usage_count: tag.usage_count,
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Get all available tags for the current user
   */
  static async getAllTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_active', true)
      .order('tag_name');

    if (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }

    return (data || []).map(tag => ({
      ...tag,
      scope: tag.scope as 'global' | 'company' | 'team'
    }));
  }

  /**
   * Get tags assigned to a specific entity
   */
  static async getEntityTags(entityType: EntityType, entityId: string): Promise<EntityTag[]> {
    const { data, error } = await supabase.rpc('get_entity_tags', {
      p_entity_type: entityType,
      p_entity_id: entityId
    });

    if (error) {
      console.error('Error fetching entity tags:', error);
      throw new Error('Failed to fetch entity tags');
    }

    return data || [];
  }

  /**
   * Create a new tag
   */
  static async createTag(tag: {
    tag_name: string;
    tag_color: string;
    tag_type?: string;
    description?: string;
    scope?: 'global' | 'company' | 'team';
    company_id?: string;
  }): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        tag_name: tag.tag_name,
        tag_color: tag.tag_color,
        tag_type: tag.tag_type || 'general',
        description: tag.description,
        scope: tag.scope || 'company',
        company_id: tag.company_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }

    return {
      ...data,
      scope: data.scope as 'global' | 'company' | 'team'
    };
  }

  /**
   * Update an existing tag
   */
  static async updateTag(tagId: string, updates: {
    tag_name?: string;
    tag_color?: string;
    tag_type?: string;
    description?: string;
  }): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      throw new Error('Failed to update tag');
    }

    return {
      ...data,
      scope: data.scope as 'global' | 'company' | 'team'
    };
  }

  /**
   * Delete a tag (soft delete by setting is_active to false)
   */
  static async deleteTag(tagId: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .update({ is_active: false })
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw new Error('Failed to delete tag');
    }
  }

  /**
   * Assign tags to an entity (replaces existing tags)
   */
  static async assignTagsToEntity(
    entityType: EntityType,
    entityId: string,
    tagIds: string[]
  ): Promise<number> {
    const { data, error } = await supabase.rpc('assign_tags_to_entity', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_tag_ids: tagIds
    });

    if (error) {
      console.error('Error assigning tags:', error);
      throw new Error('Failed to assign tags');
    }

    return data || 0;
  }

  /**
   * Add a single tag to an entity
   */
  static async addTagToEntity(
    entityType: EntityType,
    entityId: string,
    tagId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('taggable_entities')
      .insert({
        tag_id: tagId,
        entity_type: entityType,
        entity_id: entityId,
        tagged_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error && error.code !== '23505') { // Ignore duplicate constraint violations
      console.error('Error adding tag to entity:', error);
      throw new Error('Failed to add tag');
    }
  }

  /**
   * Remove a single tag from an entity
   */
  static async removeTagFromEntity(
    entityType: EntityType,
    entityId: string,
    tagId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('taggable_entities')
      .delete()
      .eq('tag_id', tagId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      console.error('Error removing tag from entity:', error);
      throw new Error('Failed to remove tag');
    }
  }

  /**
   * Get entities by tag
   */
  static async getEntitiesByTag(
    tagId: string,
    entityType?: EntityType
  ): Promise<TaggableEntity[]> {
    let query = supabase
      .from('taggable_entities')
      .select('*')
      .eq('tag_id', tagId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('tagged_at', { ascending: false });

    if (error) {
      console.error('Error fetching entities by tag:', error);
      throw new Error('Failed to fetch entities');
    }

    return data || [];
  }

  /**
   * Get tag statistics
   */
  static async getTagStats(): Promise<{
    totalTags: number;
    tagsByType: Record<string, number>;
    mostUsedTags: Tag[];
  }> {
    const { data: tags, error } = await supabase
      .from('tags')
      .select(`
        *,
        taggable_entities(count)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tag stats:', error);
      throw new Error('Failed to fetch tag statistics');
    }

    const tagsByType: Record<string, number> = {};
    const tagsWithCount = tags?.map(tag => ({
      ...tag,
      usage_count: tag.taggable_entities?.length || 0
    })) || [];

    tagsWithCount.forEach(tag => {
      tagsByType[tag.tag_type] = (tagsByType[tag.tag_type] || 0) + 1;
    });

    const mostUsedTags = tagsWithCount
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10)
      .map(tag => ({
        ...tag,
        scope: tag.scope as 'global' | 'company' | 'team'
      }));

    return {
      totalTags: tags?.length || 0,
      tagsByType,
      mostUsedTags
    };
  }

  /**
   * Merge duplicate tags
   */
  static async mergeTags(targetTagId: string, sourceTagIds: string[]): Promise<void> {
    // Update all taggable_entities to use the target tag
    for (const sourceTagId of sourceTagIds) {
      const { error: updateError } = await supabase
        .from('taggable_entities')
        .update({ tag_id: targetTagId })
        .eq('tag_id', sourceTagId);

      if (updateError) {
        console.error('Error merging tag assignments:', updateError);
        throw new Error('Failed to merge tags');
      }

      // Delete the source tag
      await this.deleteTag(sourceTagId);
    }
  }
}

export default TagService;