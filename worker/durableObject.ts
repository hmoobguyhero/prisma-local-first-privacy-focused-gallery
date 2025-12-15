import { DurableObject } from "cloudflare:workers";
import type { DemoItem, UserSettings } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  layout: 'rows',
  sortOrder: 'date-desc',
};
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // --- Settings ---
    async getSettings(): Promise<UserSettings> {
      const settings = await this.ctx.storage.get<UserSettings>("user_settings");
      return settings || DEFAULT_SETTINGS;
    }
    async saveSettings(settings: UserSettings): Promise<UserSettings> {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await this.ctx.storage.put("user_settings", newSettings);
      return newSettings;
    }
    // --- Original Demo Methods ---
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async decrement(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value -= amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) {
        return items as DemoItem[];
      }
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
}