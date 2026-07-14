import type { Plugin, PluginContext } from '../types';

class PluginRegistryClass {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(`Plugin "${plugin.manifest.id}" is already registered`);
    }
    this.plugins.set(plugin.manifest.id, plugin);
  }

  unregister(id: string): void {
    this.plugins.delete(id);
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async initializeAll(context: Record<string, unknown>): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.initialize(context as unknown as PluginContext);
    }
  }

  async destroyAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.destroy?.();
    }
    this.plugins.clear();
  }
}

export const PluginRegistry = new PluginRegistryClass();
export { usePlugin } from './usePlugin';