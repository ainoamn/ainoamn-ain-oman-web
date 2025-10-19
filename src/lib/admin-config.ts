// src/lib/admin-config.ts
export const adminDashboardConfig = {
  defaultWidgets: [
    'stats-overview',
    'recent-activity',
    'system-health'
  ],
};

export const adminMenu = [
  {
    path: '/admin/dashboard',
    translationKey: 'admin.dashboard',
    icon: '📊'
  },
  {
    path: '/admin/users',
    translationKey: 'admin.users',
    icon: '👥',
    subItems: [
      {
        path: '/admin/users/list',
        translationKey: 'admin.users.list'
      },
      {
        path: '/admin/users/roles',
        translationKey: 'admin.users.roles'
      },
      {
        path: '/admin/users/permissions',
        translationKey: 'admin.users.permissions'
      }
    ]
  },
  {
    path: '/admin/properties',
    translationKey: 'admin.properties',
    icon: '🏢',
    subItems: [
      {
        path: '/admin/properties/list',
        translationKey: 'admin.properties.list'
      },
      {
        path: '/admin/properties/add',
        translationKey: 'admin.properties.add'
      },
      {
        path: '/admin/properties/categories',
        translationKey: 'admin.properties.categories'
      }
    ]
  },
  {
    path: '/admin/content',
    translationKey: 'admin.content',
    icon: '📝',
    subItems: [
      {
        path: '/admin/content/pages',
        translationKey: 'admin.content.pages'
      },
      {
        path: '/admin/content/blog',
        translationKey: 'admin.content.blog'
      },
      {
        path: '/admin/content/media',
        translationKey: 'admin.content.media'
      }
    ]
  },
  {
    path: '/admin/settings',
    translationKey: 'admin.settings',
    icon: '⚙️'
  }
];
