<script setup>
const shortcuts = [
  {
    icon: 'tabler-calendar',
    title: 'Calendar',
    subtitle: 'Appointments',
    to: { name: 'ui-apps-calendar' },
  },
  {
    icon: 'tabler-file',
    title: 'Invoice App',
    subtitle: 'Manage Accounts',
    to: { name: 'ui-apps-invoice-list' },
  },
  {
    icon: 'tabler-user',
    title: 'Users',
    subtitle: 'Manage Users',
    to: { name: 'ui-apps-user-list' },
  },
  {
    icon: 'tabler-lock',
    title: 'Role Management',
    subtitle: 'Permission',
    to: { name: 'ui-apps-roles' },
  },
  {
    icon: 'tabler-layout-dashboard',
    title: 'Dashboard',
    subtitle: 'Dashboard Analytics',
    to: { name: 'ui-dashboards-analytics' },
  },
  {
    icon: 'tabler-settings',
    title: 'Settings',
    subtitle: 'Account Settings',
    to: {
      name: 'ui-pages-account-settings-tab',
      params: { tab: 'account' },
    },
  },
]
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
