import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 主题状态管理
 * 使用Zustand管理主题状态和切换
 */
const useThemeStore = create(
  persist(
    (set) => ({
      // 主题模式：'dark' | 'light'
      theme: 'dark',

      /**
       * 切换主题
       */
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),

      /**
       * 设置主题
       * @param {string} theme 'dark' | 'light'
       */
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);

export default useThemeStore;
