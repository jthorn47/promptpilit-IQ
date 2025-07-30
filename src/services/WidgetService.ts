import { supabase } from '@/integrations/supabase/client';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  component_name: string;
  category: string;
  required_roles: string[];
  default_config: Record<string, any> | null;
  is_active: boolean;
}

export interface UserWidgetPreference {
  id: string;
  widget_id: string;
  position: number;
  is_enabled: boolean;
  custom_config: Record<string, any> | null;
  widget?: WidgetDefinition;
}

export class WidgetService {
  private static instance: WidgetService;
  private retryCount = 3;
  private retryDelay = 1000;

  static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  private async retry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < this.retryCount; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`${context} failed (attempt ${i + 1}/${this.retryCount}):`, error);
        
        if (i < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
        }
      }
    }
    
    throw new Error(`${context} failed after ${this.retryCount} attempts: ${lastError!.message}`);
  }

  private parseJsonField<T>(value: any, defaultValue: T): T {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return value || defaultValue;
  }

  async fetchAvailableWidgets(): Promise<WidgetDefinition[]> {
    return this.retry(async () => {
      const { data, error } = await supabase
        .from('widget_definitions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        default_config: this.parseJsonField(item.default_config, {})
      }));
    }, 'Fetch available widgets');
  }

  async fetchUserPreferences(userId: string): Promise<UserWidgetPreference[]> {
    return this.retry(async () => {
      const { data, error } = await supabase
        .from('user_widget_preferences')
        .select(`
          *,
          widget:widget_definitions(*)
        `)
        .eq('user_id', userId)
        .order('position');

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        custom_config: this.parseJsonField(item.custom_config, {}),
        widget: item.widget ? {
          ...item.widget,
          default_config: this.parseJsonField(item.widget.default_config, {})
        } : undefined
      }));
    }, 'Fetch user preferences');
  }

  async updateWidgetPreference(
    userId: string,
    widgetId: string, 
    updates: Partial<Omit<UserWidgetPreference, 'id' | 'widget_id'>>
  ): Promise<void> {
    return this.retry(async () => {
      // Validate inputs
      if (!userId || !widgetId) {
        throw new Error('Invalid user ID or widget ID');
      }

      // Ensure position is valid
      if (updates.position !== undefined && updates.position < 0) {
        throw new Error('Position must be non-negative');
      }

      const { error } = await supabase
        .from('user_widget_preferences')
        .upsert({
          user_id: userId,
          widget_id: widgetId,
          ...updates
        });

      if (error) throw error;
    }, 'Update widget preference');
  }

  async addWidget(userId: string, widgetId: string, position?: number): Promise<void> {
    // Get current preferences to calculate position
    const preferences = await this.fetchUserPreferences(userId);
    const nextPosition = position ?? preferences.length;
    
    await this.updateWidgetPreference(userId, widgetId, {
      position: nextPosition,
      is_enabled: true,
      custom_config: {}
    });
  }

  async removeWidget(userId: string, widgetId: string): Promise<void> {
    return this.retry(async () => {
      const { error } = await supabase
        .from('user_widget_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('widget_id', widgetId);

      if (error) throw error;
    }, 'Remove widget');
  }

  async reorderWidgets(userId: string, reorderedPreferences: UserWidgetPreference[]): Promise<void> {
    return this.retry(async () => {
      const updates = reorderedPreferences.map((pref, index) => ({
        user_id: userId,
        widget_id: pref.widget_id,
        position: index,
        is_enabled: pref.is_enabled,
        custom_config: pref.custom_config
      }));

      const { error } = await supabase
        .from('user_widget_preferences')
        .upsert(updates);

      if (error) throw error;
    }, 'Reorder widgets');
  }

  async toggleWidget(userId: string, widgetId: string, currentPreferences: UserWidgetPreference[]): Promise<void> {
    const currentPref = currentPreferences.find(p => p.widget_id === widgetId);
    await this.updateWidgetPreference(userId, widgetId, {
      is_enabled: !currentPref?.is_enabled,
      position: currentPref?.position ?? currentPreferences.length
    });
  }

  getAvailableToAdd(widgets: WidgetDefinition[], preferences: UserWidgetPreference[]): WidgetDefinition[] {
    const addedWidgetIds = preferences.map(p => p.widget_id);
    return widgets.filter(w => !addedWidgetIds.includes(w.id));
  }

  getEnabledWidgets(preferences: UserWidgetPreference[]): UserWidgetPreference[] {
    return preferences
      .filter(p => p.is_enabled && p.widget)
      .sort((a, b) => a.position - b.position);
  }
}