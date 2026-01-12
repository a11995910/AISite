import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户状态管理
 * 使用Zustand管理用户登录状态和信息
 */
const useUserStore = create(
  persist(
    (set) => ({
      // 用户信息
      user: null,
      // JWT Token
      token: null,
      
      /**
       * 设置用户信息（登录成功后调用）
       * @param {Object} data 登录返回的数据
       */
      setUser: (data) => set({
        user: data.user,
        token: data.token
      }),
      
      /**
       * 登出
       */
      logout: () => set({
        user: null,
        token: null
      }),
      
      /**
       * 更新用户信息
       * @param {Object} userData 用户数据
       */
      updateUser: (userData) => set({ user: userData }),
      
      /**
       * 检查是否已登录
       */
      isLoggedIn: () => {
        const state = useUserStore.getState();
        return !!(state.token && state.user);
      }
    }),
    {
      name: 'user-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      })
    }
  )
);

export default useUserStore;
