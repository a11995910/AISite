import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户状态管理
 * 使用zustand进行状态管理，支持持久化
 */
const useUserStore = create(
  persist(
    (set, get) => ({
      // 用户信息
      user: null,
      // Token
      token: null,
      // 是否已登录
      isLoggedIn: false,

      /**
       * 设置用户信息和Token
       * @param {Object} data 登录返回的数据
       */
      setUser: (data) => {
        set({
          user: data.user,
          token: data.token,
          isLoggedIn: true
        });
      },

      /**
       * 更新用户信息
       * @param {Object} userInfo 用户信息
       */
      updateUser: (userInfo) => {
        set({ user: userInfo });
      },

      /**
       * 登出
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isLoggedIn: false
        });
      },

      /**
       * 获取Token
       * @returns {string|null}
       */
      getToken: () => get().token
    }),
    {
      name: 'user-storage' // localStorage中的key
    }
  )
);

export default useUserStore;
