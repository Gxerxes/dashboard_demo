export function usePlugin() {
  return {
    plugins: [],
    getPlugin: (id: string) => null,
    isPluginEnabled: (id: string) => false,
  };
}